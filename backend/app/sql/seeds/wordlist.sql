-- =============================================================================
-- SCRIPT D'INITIALISATION DE LA TABLE WORDLIST
-- Contraintes: max 8 caractères, pas de chiffres, pas de caractères spéciaux
-- 200 mots par thème
-- =============================================================================

INSERT INTO wordlist (theme, words) VALUES

-- =============================================================================
-- SPORT & FITNESS
-- =============================================================================
('Sport',
'[
    "foot","basket","tennis","natation","rugby","boxe","karate","judo","skate","velo",
    "surf","kayak","canoe","plongee","ski","snow","hockey","cricket","baseball","golf",
    "badminton","volley","handball","running","marathon","karting","aviron","voile","escrime","petanque",
    "bowling","snooker","billard","futsal","roller","trampoline","parkour","zumba","trail","rando",
    "biathlon","curling","kickboxing","enduro","rally","ballet","cheerleading","tumbling","aquabike","footing",
    "mma","lutte","sambo","sanda","muaythai","crossfit","fitness","aerobic","yoga","pilates",
    "halterophilie","muscu","athle","decathlon","frisbee","parachute","kart","bmx","climbing","escalade",
    "freerun","breakdance","jogging","squash","pingpong","waterpolo","rowing","triathlon","speedway","archery",
    "taekwondo","javelin","saut","hauteur","poids","disque","marche","sprint","crawl","brasse",
    "papillon","relais","plongeon","gym","poutre","barres","anneaux","cheval","sol","corde",
    "lancer","course","haies","perche","marteau","ring","tatami","dojo","stade","terrain",
    "piste","filet","but","panier","raquette","balle","ballon","puck","club","batte",
    "gant","casque","crampon","short","maillot","medaille","trophee","podium","record","score",
    "match","set","manche","round","periode","temps","pause","coach","arbitre","equipe",
    "joueur","gardien","attaque","defense","milieu","ailier","pivot","meneur","arriere","centre",
    "corner","penalty","touche","carton","faute","hors jeu","dribble","passe","tir","smash",
    "ace","lob","slice","drop","block","tackle","essai","transfo","melee","touche",
    "chistera","drop","caddie","tee","green","fairway","bunker","birdie","eagle","bogey",
    "dunk","layup","rebond","contre","alley oop","fadeaway","hook","free throw",
    "homerun","strike","ball","base","mound","pitcher","catcher","batter","inning","dugout"
]'),

-- =============================================================================
-- CUISINE & GASTRONOMIE
-- =============================================================================
('Cuisine',
'[
    "pomme","banane","orange","fraise","raisin","melon","kiwi","citron","poire","mangue",
    "carotte","tomate","oignon","ail","poireau","patate","navet","brocoli","endive","chou",
    "riz","pates","pain","beurre","fromage","yaourt","creme","lait","steak","poulet",
    "boeuf","porc","thon","saumon","crevette","moules","huitres","tofu","burger","pizza",
    "tacos","kebab","risotto","ramen","couscous","quinoa","miel","sucre","sel","poivre",
    "huile","epices","curry","wasabi","chili","soja","cacao","cafe","the","jus",
    "eau","soda","cookie","donut","brownie","muffin","tartine","sandwich","soupe","veloute",
    "bouillon","gratin","fondue","wok","taboule","wrap","pancake","gaufre","omelette","biscuit",
    "noisette","amande","pistache","noix","abricot","datte","figue","prune","cerise","peche",
    "sardine","calamar","salade","compote","puree","hachis","sauce","vinaigre","moutarde","mayo",
    "ketchup","pesto","aioli","rouille","tapenade","caviar","sashimi","sushi","maki","tempura",
    "gyoza","dumpling","noodle","udon","soba","tofu","seitan","falafel","houmous","guacamole",
    "salsa","nachos","burrito","enchilada","tamale","ceviche","paella","tapas","gazpacho","tortilla",
    "crepe","galette","quiche","tarte","tourte","feuillete","croissant","brioche","baguette","ficelle",
    "fougasse","focaccia","ciabatta","pretzel","bagel","scone","crumpet","waffle","churros","beignet",
    "eclair","macaron","meringue","mousse","tiramisu","panna","cotta","creme","brulee","fondant",
    "ganache","praline","truffe","nougat","caramel","fudge","brownie","cupcake","madeleine","financier",
    "clafoutis","far","kouign","canele","palmier","sable","tuile","rocher",
    "mendiant","florentin","orangette","griotte","kirsch","cognac","armagnac","calvados","rhum","whisky",
    "vodka","gin","tequila","mezcal","sake","soju","baijiu","grappa","amaretto"
]'),

-- =============================================================================
-- MUSIQUE & INSTRUMENTS (mots ≤ 10 lettres)
-- =============================================================================
('Musique',
'[
    "rock","metal","jazz","blues","rap","pop","funk","disco","techno","house",
    "trance","drill","dub","reggae","soul","opera","choeur","gospel","electro","folk",
    "violin","guitare","harpe","piano","orgue","flute","trombone","clarinet","sax","batterie",
    "tambour","cymbale","bongo","conga","ukulele","banjo","oud","tabla","tuba","rythme",
    "tempo","melodie","chant","voix","solo","duo","trio","mix","remix",
    "vinyle","album","single","concert","scene","micro","ampli","casque","radio",
    "beat","bpm","sample","loop","chorus","arpege","notes","accord","gamme","reverb",
    "delay","clave","harmo","mazurka","tango","samba","bolero","rave","ambient",
    "grunge","punk","swing","bebop","fusion","prog","indie","alt","emo",
    "hardcore","deathm","blackm","doom","thrash","speed","power","sympho","neo","post",
    "trip","hop","boom","bap","trap","drill","grime","dubstep","dnb","jungle",
    "garage","breaks","idm","glitch","noise","drone","dark","wave","synth","retro",
    "vaporw","chillw","lofi","study","sleep","focus","party","chill","vibe",
    "mood","energy","hype","mellow","smooth","groovy","funky","jazzy","bluesy","rocky",
    "basse","lead","pad","string","brass","woodwin","perc","synth","keys","organ",
    "rhodes","wurli","clav","moog","prophet","juno","dx","fm","analog",
    "digital","modular","euro","rack","patch","cable","knob","fader","button","key",
    "octave","pitch","bend","mod","wheel","sustain","pedal","damper","soft","una",
    "corda","forte","mezzo","piano","vivace","allegro","adagio","largo","presto","andante",
    "legato","staccat","pizzica","arco","vibrato","tremolo","glissan","portame","fermata","coda"
]'),

-- =============================================================================
-- CINEMA & SERIES (mots ≤ 10 lettres)
-- =============================================================================
('Cinema',
'[
    "avatar","matrix","alien","rocky","amadeus","vertigo","skyfall","memento","heat","coco",
    "frozen","titanic","dune","shrek","joker","batman","superman","logan","moana","cars",
    "fargo","psycho","casper","gravity","jungle","godzilla","coraline","tremors","predator","rango",
    "zodiac","paprika","tarzan","aladdin","mulan","ronin","tomb","speed","argo","hugo",
    "furious","antman","deadpool","django","climax","tenet","nope","noah","sunrise","annie",
    "scream","saw","ring","grudge","omen","exorcist","shining","carrie","misery","jaws",
    "twister","volcano","quake","flood","storm","tornado","cyclone","tsunami","meteor","comet",
    "alien","martian","gravity","moon","apollo","contact","arrival","blade","runner","total",
    "recall","robocop","cyborg","android","replicant","clone","mutant","xmen","magneto",
    "wolverine","storm","cyclops","beast","rogue","gambit","cable","bishop","colossus","phoenix",
    "thanos","ultron","loki","hela","kang","doom","sinister",
    "venom","carnage","goblin","octopus","vulture","electro","sandman","rhino","scorpion","lizard",
    "kingpin","bullseye","punisher","elektra","jessica","luke","cage","iron","fist",
    "defenders","shield","hydra","sword","hammer","widow","hawk","eye","ant","wasp",
    "vision","scarlet","witch","quicksilver","falcon","winter","soldier","captain","america","marvel",
    "dc","warner","disney","pixar","laika","ghibli","toei","sunrise",
    "madhouse","bones","mappa","wit","trigger","clover","shaft","kyoani","ufotable","aniplex",
    "netflix","hulu","amazon","hbo","showtime","starz","fox","cbs","nbc","abc","cw","fx","amc",
    "comedy","drama","horror","action","thriller","mystery","romance","fantasy","scifi","western"
]'),

-- =============================================================================
-- GEOGRAPHIE & VOYAGES
-- =============================================================================
('Voyage',
'[
    "france","espagne","italie","portugal","grece","turquie","pologne","norvege","suede","finlande",
    "danemark","belgique","irlande","islande","lettonie","estonie","serbie","croatie","slovenie","autriche",
    "hongrie","roumanie","bulgarie","ukraine","georgie","armenie","russie","chypre","malte","egypte",
    "tunisie","algerie","maroc","gambie","ghana","kenya","ouganda","zambie","angola","togo",
    "benin","niger","mali","tchad","soudan","lesotho","somalie","guyane","jamaique","haiti",
    "mexique","panama","belize","chili","canada","bresil","uruguay","paraguay","bolivie","perou",
    "equateur","argentine","qatar","yemen","jordanie","israel","nepal","bhoutan","chine","japon",
    "coree","taiwan","laos","inde","pakistan","iran","irak","oman","syrie","koweit",
    "brunei","malaisie","vietnam","myanmar","thailande","rwanda","burundi","libye","senegal","zimbabwe",
    "botswana","namibie","samoa","tonga","fidji","vanuatu","nauru","tuvalu","kiribati","palau",
    "paris","londres","berlin","madrid","rome","vienne","prague","budapest","varsovie","moscou",
    "tokyo","seoul","pekin","shanghai","hongkong","singapour","bangkok","hanoi","jakarta","manille",
    "sydney","melbourne","auckland","dubai","abou","dhabi","doha","riyad",
    "nairobi","lagos","accra","dakar","tunis","alger","rabat","casablanca","marrakech","fes",
    "new york","los angeles","chicago","houston","phoenix","philadelphie",
    "dallas","austin","jacksonville","columbus","charlotte","seattle",
    "denver","boston","detroit","nashville","portland","las vegas","memphis","baltimore","milwaukee",
    "plage","montagne","desert","foret","jungle","savane","toundra","glacier","volcan","canyon",
    "cascade","lac","riviere","fleuve","ocean","mer","ile","archipel","peninsule","isthme",
    "cap","golfe","baie","fjord","atoll","recif","lagune","delta","estuaire","marais"
]'),


-- =============================================================================
-- ANIMAUX & NATURE
-- =============================================================================
('Animaux',
'[
    "chien","chat","lion","tigre","zebre","singe","gorille","panda","koala","renard",
    "loup","ours","cheval","ane","mule","lama","alpaga","bison","yak","zebu",
    "rhino","hippo","dauphin","requin","baleine","phoque","otarie","saumon","truite","brochet",
    "perche","anguille","crabe","homard","crevette","pieuvre","calamar","mouche","abeille","guepe",
    "fourmi","frelon","scarabee","papillon","escargot","ver","grenouille","crapaud","cobra","python",
    "vipere","lezard","iguane","gecko","aigle","faucon","corbeau","pie","pigeon","dinde",
    "oie","canard","cygne","hibou","chouette","puma","lynx","belette","furet","rat",
    "souris","lapin","hamster","chameau","gazelle","gnou","impala","buffle","orang-outan","lemurien",
    "tapir","condor","orque","lamantin","narval","sardine","thon","maquereau","manta","murene",
    "tortue","caiman","alligator","crocodile","salamandre","triton","axolotl","meduse","anemone","corail",
    "etoile","oursin","concombre","eponge","moule","huitre","palourde","coquille","bernacle","krill",
    "plancton","algue","varech","kelp","nori","wakame","spiruline","chlorelle","euglène","amibe",
    "panthere","jaguar","leopard","guepard","serval","ocelot","caracal","margay","oncille","jaguarondi",
    "hermine","vison","loutre","blaireau","raton laveur","moufette","civette","mangouste","suricate","hyene",
    "chacal","fennec","dhole","lycaon","coyote","tanuki","binturong","coati","kinkajou","olingo",
    "castor","marmotte","ecureuil","tamia","gerboise","chinchilla","viscache","capybara","agouti","paca",
    "colibri","toucan","ara","cacatoès","perruche","calao","martin-pêcheur","huppe","guepier","rollier",
    "loriot","grive","merle","rougegorge","mesange","sitelle","grimpeur","pic","geai",
    "casse-noix","choucas","freux","corneille","grand corbeau","chocard","crave","pie",
    "grieche","etourneau","moineau","pinson","verdier","chardonneret","linotte","sizerin","bec-croisé"
]'),

-- =============================================================================
-- METIERS & PROFESSIONS
-- =============================================================================
('Metiers',
'[
    "boulanger","plombier","pompier","docteur","dentiste","avocat","notaire","juge","infirmier","peintre",
    "sculpteur","acteur","auteur","editeur","journaliste","reporter","pilote","marin","soldat","gardien",
    "agent","serveur","cuisinier","patron","banquier","comptable","analyste","dev","hacker","ingenieur",
    "technicien","architecte","designer","graphiste","styliste","modeleur","vendeur","caissier","gerant","directeur",
    "coach","sportif","danseur","musicien","chanteur","dj","producteur","moniteur","prof","chercheur",
    "data","psy","medecin","chirurgien","kine","soudeur","mecanicien","artisan","menuisier","jardinier",
    "agriculteur","paysagiste","electricien","veterinaire","astronaute","capitaine","chauffeur","conducteur","forgeron","minier",
    "livreur","traiteur","boucher","charcutier","pecheur","facteur","controleur","auditeur","douanier","gendarme",
    "policier","magasinier","retailer","sommelier","barman","barista","mixologue","maitre","hotelier","concierge",
    "receptionniste","portier","voituriers","bagagiste","femme de chambre","gouvernante","majordome","butler","nanny",
    "babysitter","educateur","animateur","mediateur","interprete","traducteur","guide","conférencier","formateur","tuteur",
    "mentor","conseiller","consultant","expert","specialiste","generaliste","polyvalent","freelance","interim","cdd",
    "cdi","stagiaire","apprenti","alternant","benevole","volontaire","militant","activiste","syndicaliste","delegue",
    "representant","ambassadeur","attache","diplomate","consul","prefet","maire","depute","senateur","ministre",
    "secretaire","greffier","huissier","commissaire","procureur","magistrat","assesseur","juree","temoin","plaignant",
    "accuse","defendeur","partie civile","victime","suspect","prevenu","inculpe","condamne","detenu",
    "gardien","prison","surveillant","probation","liberation","conditionnelle","bracelet electronique","travaux","interet general",
    "amende","sursis","reclusion","criminel","correctionnel","tribunal","cour","appel","cassation",
    "europeen","international","arbitrage","mediation","conciliation","negociation","transaction","accord","contrat","convention",
    "traite","charte","statut","reglement","loi","decret","arrete","circulaire","directive","recommandation"
]'),

-- =============================================================================
-- COULEURS & ART
-- =============================================================================
('Couleurs',
'[
    "rouge","bleu","vert","jaune","noir","blanc","rose","violet","orange","cyan",
    "magenta","indigo","ocre","beige","marron","gris","saumon","olive","or","argent",
    "ambre","corail","ivoire","creme","pastel","marine","azur","turquoise","sable","taupe",
    "rubis","opale","jade","ebene","perle","aqua","lilas","prune","fuchsia","moka",
    "amethyste","topaze","emeraude","saphir","grenat","onyx","obsidienne","quartz","cristal","diamant",
    "platine","bronze","cuivre","laiton","etain","acier","chrome","titane","aluminium","zinc",
    "cobalt","nickel","manganese","mercure","plomb","fer","carbone","soufre","azote","oxygene",
    "neon","argon","helium","krypton","xenon","radon","fluor","chlore","brome","iode",
    "vermillon","carmin","cramoisi","bordeaux","grenat","cerise","framboise","fraise","tomate","brique",
    "rouille","cuivre","cannelle","caramel","miel","ambre","or","jaune","citron","paille",
    "ble","mais","moutarde","safran","curry","curcuma","gingembre","paprika","piment","cayenne",
    "corail","peche","abricot","melon","mandarine","orange","citrouille","carotte","tangerine","kumquat",
    "chartreuse","lime","pistache","menthe","emeraude","jade","olive","avocat","kaki","mousse",
    "sapin","foret","bouteille","hunter","teal","canard","paon","petrole","ocean","marine",
    "cobalt","saphir","royal","electrique","ciel","azur","celeste","glacier","givre","poudre",
    "lavande","mauve","orchidee","violette","aubergine","prune","mure","cassis","raisin","vin",
    "bourgogne","cerise","sang","rubis","grenat","carmin","vermillon","ecarlate","pourpre","magenta",
    "fuchsia","rose","bonbon","barbe à papa","saumon","corail","peche","chair","nude",
    "ivoire","coquille","oeuf","creme","vanille","champagne","platine","argent","perle","nacre",
    "fumee","ardoise","anthracite","charbon","jais","encre","corbeau","minuit","abysse","profond"
]'),

-- =============================================================================
-- JEUX VIDEO & GAMING
-- =============================================================================
('Gaming',
'[
    "mario","zelda","link","pokemon","pikachu","sonic","kirby","metroid","samus","donkey",
    "kong","yoshi","luigi","peach","bowser","ganon","wario","waluigi","toad","koopa",
    "goomba","shyguy","boo","lakitu","thwomp","chomp","piranha","bullet","bill","blooper",
    "cheep","wiggler","magikoopa","kamek","hammer","bro","boomerang","fire","ice","sumo",
    "tetris","pong","pacman","galaga","space","invaders","asteroid","centipede","frogger","qbert",
    "digdug","joust","defender","tempest","missile","command","breakout","arkanoid","bubble","bobble",
    "contra","gradius","rtype","darius","thunder","force","raiden","strikers","metal","slug",
    "street","fighter","tekken","virtua","mortal","kombat","guilty","gear","blazblue","skullgirls",
    "smash","bros","brawl","melee","ultimate","rivals","aether","brawlhalla","multiversus","nasb",
    "fortnite","pubg","apex","warzone","valorant","csgo","overwatch","rainbow","six","siege","tarkov",
    "rust","dayz","ark","conan","valheim","terraria","starbound","factorio","satisfactory","dyson",
    "sphere","rimworld","dwarf","fortress","prison","architect","cities","skylines","simcity","tropico",
    "civilization","humankind","crusader","kings","europa","universalis","stellaris","victoria","imperator","rome",
    "total","war","warhammer","age","empires","mythology","starcraft","warcraft","command","conquer",
    "supreme","commander","homeworld","sins","solar","empire","endless","space","legend","galactic",
    "masters","orion","stellaris","alpha","centauri","freeciv","openttd","simutrans","locomotion","railroad",
    "tycoon","rollercoaster","theme","park","hospital","planet","zoo","coaster","jurassic","world",
    "evolution","frontier","elite","dangerous","star","citizen","no","man","sky","kerbal",
    "space","program","orbiter","simplerockets","spaceflight","simulator","universe","sandbox","galaxial","starsector",
    "distant","worlds","aurora","dominions","conquest","stars","master","orion","sword","stars"
]'),

-- =============================================================================
-- MAGIE & FANTAISIE
-- =============================================================================
('Fantaisie',
'[
    "dragon","licorne","phoenix","griffon","chimere","hydre","kraken","leviathan","behemoth","basilic",
    "cocatrix","wyvern","drake","wyrm","serpent","lindworm","amphisbaena","ouroboros","quetzalcoatl",
    "roc","simorgh","garuda","thunderbird","firebird","oiseau","feu","glace","tonnerre","foudre",
    "eclair","tempete","ouragan","cyclone","tornade","tsunami","seisme","volcan","eruption","lave",
    "magma","obsidienne","cristal","gemme","rubis","saphir","emeraude","diamant","topaze","amethyste",
    "opale","jade","onyx","grenat","peridot","aigue-marine","turquoise","lapis-lazuli",
    "malachite","jaspe","agate","calcédoine","cornaline","sardoine","heliodore","alexandrite","tanzanite","zircon",
    "sorcier","mage","enchantement","warlock","wizard","witch","shaman","druide","necromancien","pyromancien",
    "cryomancien","electromancien","hydromancien","geomancien","anemo","dendro","arcane","mystique","occultisme","esoterique",
    "hermetique","alchimie","transmutation","elixir","philtre","potion","breuvage","onguent","baume","cataplasme",
    "talisman","amulette","fetiche","totem","relique","artefact","grimoire","codex","manuscrit","parchemin",
    "rune","glyphe","sigil","sceau","pentacle","hexagramme","mandala","yantra","chakra","meridien",
    "aura","ether","mana","chi","ki","prana","qi","force","vitale","energie",
    "cosmique","divin","celeste","infernal","demoniaque","angelique","seraphique","cherubique","archange","throne",
    "dominion","vertu","puissance","principauté","element","primordial","chaos","ordre","lumiere","tenebres",
    "ombre","penombre","crepuscule","aurore","zenith","nadir","horizon","infini","eternite","immortel",
    "elfe","nain","hobbit","orc","gobelin","troll","ogre","geant","titan","cyclope",
    "centaure","minotaure","satyre","faune","nymphe","dryade","naiade","nereide","sirene","ondine",
    "sylphe","gnome","salamandre","lutin","farfadet","korrigan","leprechaun","brownie","pixie","sprite",
    "fee","banshee","spectre","wraith","fantome","revenant","lich","vampire","loup-garou"
]'),

-- =============================================================================
-- ESPACE & ASTRONOMIE
-- =============================================================================
('Espace',
'[
    "soleil","lune","terre","mars","venus","mercure","jupiter","saturne","uranus","neptune",
    "pluton","ceres","eris","makemake","haumea","sedna","quaoar","orcus","varuna","ixion",
    "chaos","nix","hydra","charon","styx","kerberos","dysnomia","namaka","hiʻiaka","weywot",
    "asteroide","comete","meteore","bolide","meteorite","micrometeore","poussiere","cosmique","rayonnement","solaire",
    "vent","couronne","chromosphère","photosphere","tache","eruption","protubérance","filament","spicule","granule",
    "eclipse","occultation","transit","conjonction","opposition","quadrature","sextile","trine","aspect","synodique",
    "sidereal","tropical","anomalistique","periode","orbitale","revolution","rotation","axiale","precession","nutation",
    "galaxie","voie","lactee","andromede","triangle","sculptor","fourneau","eridan","orion","taureau",
    "gemeaux","cancer","lion","vierge","balance","scorpion","sagittaire","capricorne","verseau","poissons",
    "belier","nebuleuse","amas","globulaire","ouvert","superamas","filament","cosmique","vide","mur",
    "grand","attracteur","laniakea","persee","coma","virgo","centaure","hydra","fornax","horologe",
    "etoile","naine","geante","supergeante","hypergeante","pulsar","magnetar","quasar","blazar","seyfert",
    "nova","supernova","kilonova","hypernova","trou","noir","singularité","horizon","ergosphere",
    "disque","accretion","jet","relativite","courbure","espace","temps","geodesique","tenseur","metrique",
    "einstein","hawking","penrose","wheeler","thorne","guth","linde","vilenkin","susskind","maldacena",
    "string","brane","bulk","multivers","bulle","inflation","cosmologie","big","bang","crunch",
    "rip","freeze","bounce","cyclic","ekpyrotique","steady","state","tired","light","plasma",
    "matiere","noire","energie","sombre","constante","cosmologique","hubble","redshift","blueshift","doppler",
    "parallax","parsec","annee","lumiere","unite","astronomique","rayon","solaire","masse",
    "magnitude","absolue","spectral","classe","russell","sequence","principale","branche"
]'),

-- =============================================================================
-- MYTHOLOGIE & LEGENDES
-- =============================================================================
('Mythes',
'[
    "zeus","hera","poseidon","hades","athena","apollon","artemis","aphrodite","ares","hephaistos",
    "hermes","dionysos","demeter","hestia","persephone","eros","pan","morphee","hypnos","thanatos",
    "nemesis","nike","tyche","hecate","iris","helios","selene","eos","eole","boree",
    "zephyr","notos","eurus","triton","protee","nereus","amphitrite","thetis","galatee","scylla",
    "charybde","sirenes","cyclopes","centaure","minotaure","meduse","gorgones","echidna","typhon","cerbere",
    "chimere","sphinx","hydre","nemee","erymanthe","cretois","stymphale","augias","hippolyte","geryon",
    "hesperides","atlas","promethee","epimethee","pandore","deucalion","pyrrha","orphee","eurydice","hercule",
    "achille","hector","ulysse","agamemnon","menelas","paris","helene","cassandre","priam","hecuba",
    "andromaque","enee","didon","romulus","remus","numa","tarquin","brutus","lucretia","horatius",
    "cincinnatus","camillus","fabius","scipion","caton","cesar","auguste","tibere","caligula","claude",
    "odin","thor","loki","freya","frigg","balder","tyr","heimdall","njord","frey",
    "skadi","idun","bragi","forseti","vidar","vali","ull","hoenir","mimir","kvasir",
    "fenrir","jormungand","hel","sleipnir","huginn","muninn","geri","freki","ratatosk","nidhogg",
    "yggdrasil","bifrost","asgard","midgard","jotunheim","niflheim","muspelheim","vanaheim","alfheim","svartalfheim",
    "helheim","ragnarok","valhalla","fimbulvetr","ginnungagap","audhumla","ymir","buri","bor","bestla",
    "ra","osiris","isis","horus","seth","anubis","thot","maat","nephthys","hathor",
    "sekhmet","bastet","sobek","khnum","ptah","amon","aton","nut","geb","shu",
    "tefnut","apep","ammit","bennu","scarabee","ankh","djed","oudjat","cartouche","hieroglyphe",
    "pharaon","pyramide","sphinx","obelisque","temple","mastaba","sarcophage","momie","canope","papyrus",
    "hierophante","scribe","vizir","nome","delta","cataracte","inondation","nilometre","shadouf","chadouf"
]')

ON CONFLICT (theme) DO UPDATE SET words = EXCLUDED.words;