# /backend/app/scripts/db_manager.py
"""
Script de gestion de la base de données.

Usage:
    python -m app.scripts.db_manager create      # Crée les tables
    python -m app.scripts.db_manager drop        # Supprime les tables
    python -m app.scripts.db_manager reset       # Drop + Create
    python -m app.scripts.db_manager backup      # Sauvegarde les données
    python -m app.scripts.db_manager restore     # Restaure depuis une sauvegarde
    python -m app.scripts.db_manager seed        # Insère des données de base
    python -m app.scripts.db_manager status      # Affiche l'état de la DB
"""

import argparse
import asyncio
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

# Charger les variables d'environnement
load_dotenv(".env.local")

# Import des modèles pour que SQLModel les connaisse
from app.models.tables import User, GameSession, WordList
from app.models.schemas import *
from app.core.db import engine

# =============================================================================
# CONFIGURATION
# =============================================================================

SCRIPT_DIR = Path(__file__).parent.resolve()
BACKUP_DIR = SCRIPT_DIR / "backups"
SEEDS_DIR = SCRIPT_DIR / "seeds"

# Couleurs pour le terminal
class Colors:
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    RESET = "\033[0m"
    BOLD = "\033[1m"


def log_success(msg: str) -> None:
    print(f"{Colors.GREEN}✅ {msg}{Colors.RESET}")


def log_error(msg: str) -> None:
    print(f"{Colors.RED}❌ {msg}{Colors.RESET}")


def log_warning(msg: str) -> None:
    print(f"{Colors.YELLOW}⚠️  {msg}{Colors.RESET}")


def log_info(msg: str) -> None:
    print(f"{Colors.BLUE}ℹ️  {msg}{Colors.RESET}")


def log_header(msg: str) -> None:
    print(f"\n{Colors.BOLD}{'='*60}")
    print(f"  {msg}")
    print(f"{'='*60}{Colors.RESET}\n")


# =============================================================================
# DATABASE OPERATIONS
# =============================================================================


async def create_tables() -> bool:
    """Crée toutes les tables définies dans SQLModel."""
    log_header("CRÉATION DES TABLES")
    
    try:
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        
        log_success("Tables créées avec succès.")
        return True
        
    except SQLAlchemyError as e:
        log_error(f"Erreur lors de la création: {e}")
        return False


async def drop_tables(force: bool = False) -> bool:
    """Supprime toutes les tables."""
    log_header("SUPPRESSION DES TABLES")
    
    if not force:
        log_warning("Cette opération va SUPPRIMER toutes les données!")
        confirmation = input("Tapez 'CONFIRM' pour continuer: ")
        if confirmation != "CONFIRM":
            log_info("Opération annulée.")
            return False
    
    try:
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.drop_all)
        
        log_success("Tables supprimées avec succès.")
        return True
        
    except SQLAlchemyError as e:
        log_error(f"Erreur lors de la suppression: {e}")
        return False


async def reset_database(force: bool = False) -> bool:
    """Supprime et recrée toutes les tables."""
    log_header("RESET DE LA BASE DE DONNÉES")
    
    if not force:
        log_warning("Cette opération va SUPPRIMER toutes les données et recréer les tables!")
        confirmation = input("Tapez 'RESET' pour continuer: ")
        if confirmation != "RESET":
            log_info("Opération annulée.")
            return False
    
    # Drop
    drop_success = await drop_tables(force=True)
    if not drop_success:
        return False
    
    # Create
    create_success = await create_tables()
    if not create_success:
        return False
    
    log_success("Base de données réinitialisée avec succès.")
    return True


async def get_db_status() -> None:
    """Affiche l'état actuel de la base de données."""
    log_header("ÉTAT DE LA BASE DE DONNÉES")
    
    try:
        async with AsyncSession(engine) as session:
            # Liste des tables
            tables_query = text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)
            result = await session.exec(tables_query)
            tables = [row[0] for row in result.all()]
            
            if not tables:
                log_warning("Aucune table trouvée.")
                return
            
            print(f"Tables existantes ({len(tables)}):")
            print("-" * 40)
            
            for table in tables:
                # Compter les lignes
                count_query = text(f"SELECT COUNT(*) FROM {table};")
                count_result = await session.exec(count_query)
                count = count_result.first()[0]
                print(f"  📋 {table}: {count} lignes")
            
            print("-" * 40)
            log_success("Connexion à la DB OK.")
            
    except SQLAlchemyError as e:
        log_error(f"Erreur de connexion: {e}")


# =============================================================================
# BACKUP & RESTORE
# =============================================================================


def get_db_url_for_cli() -> Optional[str]:
    """Récupère et nettoie l'URL de la DB pour pg_dump/pg_restore."""
    db_url = os.environ.get("DATABASE_URL")
    
    if not db_url:
        log_error("Variable DATABASE_URL manquante.")
        return None
    
    # Retirer le driver async pour pg_dump
    return db_url.replace("+asyncpg", "")


def backup_database(backup_name: Optional[str] = None) -> bool:
    """Sauvegarde la base de données avec pg_dump."""
    log_header("SAUVEGARDE DE LA BASE DE DONNÉES")
    
    db_url = get_db_url_for_cli()
    if not db_url:
        return False
    
    # Créer le dossier de backup
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    
    # Nom du fichier
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = backup_name or f"backup_{timestamp}.sql"
    if not filename.endswith(".sql"):
        filename += ".sql"
    
    backup_path = BACKUP_DIR / filename
    
    log_info(f"Sauvegarde vers: {backup_path}")
    
    command = [
        "pg_dump",
        f"--dbname={db_url}",
        "-F", "p",  # Format plain text
        "--clean",  # Ajouter DROP avant CREATE
        "--if-exists",  # Éviter les erreurs si les tables n'existent pas
        "-f", str(backup_path),
    ]
    
    try:
        result = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
        )
        
        file_size = backup_path.stat().st_size / 1024  # Ko
        log_success(f"Sauvegarde terminée ({file_size:.1f} Ko)")
        log_info(f"Fichier: {backup_path}")
        return True
        
    except subprocess.CalledProcessError as e:
        log_error(f"Échec pg_dump: {e.stderr}")
        return False
        
    except FileNotFoundError:
        log_error("pg_dump non trouvé. Installez PostgreSQL client tools.")
        return False


def restore_database(backup_file: Optional[str] = None, force: bool = False) -> bool:
    """Restaure la base de données depuis une sauvegarde."""
    log_header("RESTAURATION DE LA BASE DE DONNÉES")
    
    db_url = get_db_url_for_cli()
    if not db_url:
        return False
    
    # Si pas de fichier spécifié, lister les backups disponibles
    if not backup_file:
        backups = list_backups()
        if not backups:
            log_error("Aucune sauvegarde trouvée.")
            return False
        
        print("Sauvegardes disponibles:")
        for i, backup in enumerate(backups, 1):
            size = backup.stat().st_size / 1024
            mtime = datetime.fromtimestamp(backup.stat().st_mtime)
            print(f"  {i}. {backup.name} ({size:.1f} Ko) - {mtime:%Y-%m-%d %H:%M}")
        
        choice = input("\nNuméro du backup à restaurer (ou 'q' pour quitter): ")
        if choice.lower() == 'q':
            return False
        
        try:
            backup_path = backups[int(choice) - 1]
        except (ValueError, IndexError):
            log_error("Choix invalide.")
            return False
    else:
        backup_path = BACKUP_DIR / backup_file
        if not backup_path.exists():
            log_error(f"Fichier non trouvé: {backup_path}")
            return False
    
    if not force:
        log_warning(f"Restauration de: {backup_path.name}")
        log_warning("Cette opération va ÉCRASER les données actuelles!")
        confirmation = input("Tapez 'RESTORE' pour continuer: ")
        if confirmation != "RESTORE":
            log_info("Opération annulée.")
            return False
    
    log_info(f"Restauration depuis: {backup_path}")
    
    command = [
        "psql",
        f"--dbname={db_url}",
        "-f", str(backup_path),
    ]
    
    try:
        result = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
        )
        
        log_success("Restauration terminée.")
        return True
        
    except subprocess.CalledProcessError as e:
        log_error(f"Échec psql: {e.stderr}")
        return False
        
    except FileNotFoundError:
        log_error("psql non trouvé. Installez PostgreSQL client tools.")
        return False


def list_backups() -> list[Path]:
    """Liste les fichiers de sauvegarde disponibles."""
    if not BACKUP_DIR.exists():
        return []
    
    backups = sorted(
        BACKUP_DIR.glob("*.sql"),
        key=lambda f: f.stat().st_mtime,
        reverse=True,
    )
    return backups


def cleanup_old_backups(keep: int = 10) -> None:
    """Supprime les anciennes sauvegardes, garde les N plus récentes."""
    log_header("NETTOYAGE DES SAUVEGARDES")
    
    backups = list_backups()
    
    if len(backups) <= keep:
        log_info(f"Seulement {len(backups)} backup(s), rien à supprimer.")
        return
    
    to_delete = backups[keep:]
    
    for backup in to_delete:
        backup.unlink()
        log_info(f"Supprimé: {backup.name}")
    
    log_success(f"{len(to_delete)} sauvegarde(s) supprimée(s).")


# =============================================================================
# SEEDING
# =============================================================================

async def execute_sql_file(filepath: Path) -> bool:
    """Exécute un fichier SQL."""
    if not filepath.exists():
        log_error(f"Fichier non trouvé: {filepath}")
        return False
    
    log_info(f"Exécution de: {filepath.name}")
    
    sql_content = filepath.read_text(encoding="utf-8")
    
    try:
        async with engine.begin() as conn:
            # Exécuter le SQL brut
            await conn.execute(text(sql_content))
        
        log_success(f"{filepath.name} exécuté avec succès.")
        return True
        
    except SQLAlchemyError as e:
        log_error(f"Erreur SQL: {e}")
        return False


async def execute_all_sql_in_dir(directory: Path) -> None:
    """Exécute tous les fichiers .sql d'un dossier."""
    if not directory.exists():
        log_warning(f"Dossier non trouvé: {directory}")
        return
    
    sql_files = sorted(directory.glob("*.sql"))
    
    if not sql_files:
        log_warning("Aucun fichier SQL trouvé.")
        return
    
    log_info(f"Fichiers SQL trouvés: {len(sql_files)}")
    
    for sql_file in sql_files:
        await execute_sql_file(sql_file)


async def seed_database() -> None:
    """Insère toutes les données de base depuis les fichiers SQL."""
    log_header("SEED DE LA BASE DE DONNÉES")
    
    await execute_all_sql_in_dir(SEEDS_DIR)
    
    log_success("Seed terminé.")


async def seed_wordlists() -> None:
    """Insère uniquement les wordlists."""
    log_header("SEED DES WORDLISTS")
    
    wordlist_file = SEEDS_DIR / "wordlists.sql"
    await execute_sql_file(wordlist_file)




# =============================================================================
# CLI
# =============================================================================


def main():
    parser = argparse.ArgumentParser(
        description="Outil de gestion de la base de données",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
                Exemples:
                python -m app.scripts.db_manager create
                python -m app.scripts.db_manager reset --force
                python -m app.scripts.db_manager backup --name pre_migration
                python -m app.scripts.db_manager restore
                python -m app.scripts.db_manager seed
        """,
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Commande à exécuter")
    
    # create
    subparsers.add_parser("create", help="Crée les tables")
    
    # drop
    drop_parser = subparsers.add_parser("drop", help="Supprime les tables")
    drop_parser.add_argument("--force", "-f", action="store_true", help="Skip confirmation")
    
    # reset
    reset_parser = subparsers.add_parser("reset", help="Reset complet (drop + create)")
    reset_parser.add_argument("--force", "-f", action="store_true", help="Skip confirmation")
    
    # status
    subparsers.add_parser("status", help="Affiche l'état de la DB")
    
    # backup
    backup_parser = subparsers.add_parser("backup", help="Sauvegarde la DB")
    backup_parser.add_argument("--name", "-n", help="Nom du fichier de backup")
    
    # restore
    restore_parser = subparsers.add_parser("restore", help="Restaure depuis un backup")
    restore_parser.add_argument("--file", "-f", help="Fichier de backup à restaurer")
    restore_parser.add_argument("--force", action="store_true", help="Skip confirmation")
    
    # cleanup
    cleanup_parser = subparsers.add_parser("cleanup", help="Nettoie les vieux backups")
    cleanup_parser.add_argument("--keep", "-k", type=int, default=10, help="Nombre à garder")
    
    # seed
    subparsers.add_parser("seed", help="Exécute tous les fichiers SQL de seeds/")

    seed_file_parser = subparsers.add_parser("seed-file", help="Exécute un fichier SQL spécifique")
    seed_file_parser.add_argument("file", help="Chemin du fichier SQL")
    
    # list
    subparsers.add_parser("list", help="Liste les backups disponibles")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Exécution
    if args.command == "create":
        asyncio.run(create_tables())
        
    elif args.command == "drop":
        asyncio.run(drop_tables(force=args.force))
        
    elif args.command == "reset":
        asyncio.run(reset_database(force=args.force))
        
    elif args.command == "status":
        asyncio.run(get_db_status())
        
    elif args.command == "backup":
        backup_database(backup_name=args.name)
        
    elif args.command == "restore":
        restore_database(backup_file=args.file, force=args.force)
        
    elif args.command == "cleanup":
        cleanup_old_backups(keep=args.keep)
        
    # Dans le bloc if/elif
    elif args.command == "seed":
        asyncio.run(seed_database())
        
    elif args.command == "seed-file":
        filepath = Path(args.file)
        if not filepath.is_absolute():
            filepath = SEEDS_DIR / filepath
        asyncio.run(execute_sql_file(filepath))
        
    elif args.command == "list":
        backups = list_backups()
        if not backups:
            log_warning("Aucune sauvegarde trouvée.")
        else:
            print(f"\nSauvegardes disponibles ({len(backups)}):")
            print("-" * 50)
            for backup in backups:
                size = backup.stat().st_size / 1024
                mtime = datetime.fromtimestamp(backup.stat().st_mtime)
                print(f"  📁 {backup.name}")
                print(f"     {size:.1f} Ko | {mtime:%Y-%m-%d %H:%M:%S}")


if __name__ == "__main__":
    main()