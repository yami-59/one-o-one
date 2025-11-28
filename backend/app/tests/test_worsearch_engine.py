from app.models.schemas import WordSolution
import pytest
from app.games.wordsearch.wordsearch_generator import WordSearchGenerator
from app.games.wordsearch.wordsearch_engine import WordSearchEngine
from app.models.tables import *
from app.models.schemas import *
import uuid
from app.utils.enums import GameName


@pytest.mark.asyncio
async def test_invalid_selection(generator,db_session,redis_client):
    
    player_a_id = f"test-p-a-{uuid.uuid4()}"
    player_b_id = f"test-p-b-{uuid.uuid4()}"
    game_uuid = str(uuid.uuid4())

    # 2. Création et enregistrement des UTILISATEURS (PostgreSQL)
    db_session.add(User(identifier=player_a_id))
    db_session.add(User(identifier=player_b_id))
    

    # 4. Création et enregistrement de la SESSION DE JEU (PostgreSQL)
    game_session = GameSession(
        game_id=game_uuid,
        player1_identifier=player_a_id,
        player2_identifier=player_b_id,
        game_name=GameName.wordsearch
    )
    

    db_session.add(game_session)
    await db_session.commit() 

    # 3. Génération de la GRILLE et des SOLUTIONS (WordSearchGenerator)
    grid_data, solutions = generator.generate() 

       
    # Créer l'état initial du jeu
    init_data = WordSearchState(
        grid_data=grid_data,
        solution_words=solutions, 
    )

    
    # 5. Sauvegarde de l'ÉTAT ACTIF dans Redis (Utilise le moteur pour la commodité)
    # Note: On utilise le moteur pour la persistance Redis, mais on doit l'initialiser ici.
    engine = WordSearchEngine(game_uuid, db_session, redis_client)
    await engine._save_game_state(init_data)

    original_solution = generator.solutions[0]
    
    mok_solution=original_solution.model_copy()
    
    mok_solution.word="RAN"

    response = await engine.validate_selection(player_a_id,mok_solution)


    assert  response == {"success": False, "reason": "La sélection de lettres ne correspond pas au mot."}

    found = {
        player_a_id:[original_solution.word]
    }



    init_data.words_found=found


    await engine._save_game_state(init_data)

    response = await engine._get_game_state()
    assert  response == init_data

    already_found_word = original_solution

    response = await engine.validate_selection(player_b_id,already_found_word)

    assert response ==  {"success": False, "reason": "Mot déjà trouvé par un joueur."}

    response = await engine.validate_selection(player_b_id, generator.solutions[1])

    assert response ==  {
            "success": True, 
            "score_update": 10, 
            "new_score": 10,
            "word": generator.solutions[1].word
        }

    state = await engine._get_game_state()


    assert state.words_found[player_b_id] == [generator.solutions[1].word]
    assert state.realtime_score[player_b_id] == 10


    pass

    




