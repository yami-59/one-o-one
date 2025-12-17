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
    "badmin","volley","handball","running","marathon","karting","aviron","voile","escrime","petanque",
    "bowling","snooker","billard","futsal","roller","trampol","parkour","zumba","trail","rando",
    "biathlon","curling","kickbox","enduro","rally","ballet","cheer","tumbling","aquabike","footing",
    "mma","lutte","sambo","sanda","muaythai","crossfit","fitness","aerobic","yoga","pilates",
    "haltero","muscu","athle","decathlo","frisbee","parachut","kart","bmx","climbing","escalade",
    "freerun","break","jogging","squash","pingpong","waterpol","rowing","triathlo","speedway","archery",
    "taekwond","javelin","saut","hauteur","poids","disque","marche","sprint","crawl","brasse",
    "papillon","relais","plongeon","gym","poutre","barres","anneaux","cheval","sol","corde",
    "lancer","course","haies","perche","marteau","ring","tatami","dojo","stade","terrain",
    "piste","filet","but","panier","raquette","balle","ballon","puck","club","batte",
    "gant","casque","crampon","short","maillot","medaille","trophee","podium","record","score",
    "match","set","manche","round","periode","temps","pause","coach","arbitre","equipe",
    "joueur","gardien","attaque","defense","milieu","ailier","pivot","meneur","arriere","centre",
    "corner","penalty","touche","carton","faute","hors jeu","dribble","passe","tir","smash",
    "ace","lob","slice","drop","block","tackle","essai","transfo","melee","touche",
    "chistera","drop","caddie","tee","green","fairway","bunker","birdie","eagle","bogey",
    "dunk","layup","rebond","contre","alley","oop","fadeaway","hook","free","throw",
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
    "gyoza","dumpling","noodle","udon","soba","tofu","seitan","falafel","houmous","guacamol",
    "salsa","nachos","burrito","enchilad","tamale","ceviche","paella","tapas","gazpacho","tortilla",
    "crepe","galette","quiche","tarte","tourte","feuilete","croissnt","brioche","baguette","ficelle",
    "fougasse","focaccia","ciabatta","pretzel","bagel","scone","crumpet","waffle","churros","beignet",
    "eclair","macaron","meringue","mousse","tiramisu","panna","cotta","creme","brulee","fondant",
    "ganache","praline","truffe","nougat","caramel","fudge","brownie","cupcake","madelein","financie",
    "clafouti","far","kouign","canele","palmier","sable","tuile","rocher",
    "mendinat","florent","oranget","griotte","kirsch","cognac","armagnac","calvados","rhum","whisky",
    "vodka","gin","tequila","mezcal","sake","soju","baijiu","grappa","amaretto"
]'),

-- =============================================================================
-- MUSIQUE & INSTRUMENTS
-- =============================================================================
('Musique',
'[
    "rock","metal","jazz","blues","rap","pop","funk","disco","techno","house",
    "trance","drill","dub","reggae","soul","opera","choeur","gospel","electro","folk",
    "violin","guitare","harpe","piano","orgue","flute","trombone","clarinet","sax","batterie",
    "tambour","cymbale","bongo","conga","ukulele","banjo","oud","tabla","tuba","rythme",
    "tempo","melodie","chant","voix","solo","duo","trio","quartet","mix","remix",
    "vinyle","album","single","playlist","concert","scene","micro","ampli","casque","radio",
    "beat","bpm","sample","loop","chorus","arpege","notes","accord","gamme","reverb",
    "delay","chorale","clave","harmo","mazurka","tango","samba","bolero","rave","ambient",
    "grunge","punk","swing","bebop","fusion","prog","indie","alt","emo",
    "hardcore","deathm","blackm","doom","thrash","speed","power","sympho","neo","post",
    "trip","hop","boom","bap","trap","drill","grime","dubstep","dnb","jungle",
    "garage","breaks","idm","glitch","noise","drone","dark","wave","synth","retro",
    "vaporw","chillw","lofi","study","sleep","focus","workout","party","chill","vibe",
    "mood","energy","hype","mellow","smooth","groovy","funky","jazzy","bluesy","rocky",
    "basse","lead","pad","string","brass","woodwin","perc","synth","keys","organ",
    "rhodes","wurli","clav","moog","prophet","juno","dx","fm","analog",
    "digital","modular","euro","rack","patch","cable","knob","fader","button","key",
    "octave","pitch","bend","mod","wheel","sustain","pedal","damper","soft","una",
    "corda","forte","mezzo","piano","vivace","allegro","adagio","largo","presto","andante",
    "legato","staccat","pizzica","arco","vibrato","tremolo","glissan","portame","fermata","coda"
]'),

-- =============================================================================
-- CINEMA & SERIES
-- =============================================================================
('Cinema',
'[
    "avatar","matrix","alien","rocky","amadeus","vertigo","skyfall","memento","heat","coco",
    "frozen","titanic","dune","shrek","joker","batman","superman","logan","moana","cars",
    "fargo","psycho","casper","gravity","jungle","godzilla","coraline","tremors","predator","rango",
    "zodiac","paprika","tarzan","aladdin","mulan","ronin","tomb","speed","argo","hugo",
    "furious","antman","deadpol","django","climax","tenet","nope","noah","sunrise","annie",
    "scream","saw","ring","grudge","omen","exorcist","shining","carrie","misery","jaws",
    "twister","volcano","quake","flood","storm","tornado","cyclone","tsunami","meteor","comet",
    "alien","martian","gravity","moon","apollo","contact","arrival","blade","runner","total",
    "recall","robocop","termint","cyborg","android","replicnt","clone","mutant","xmen","magneto",
    "wolverin","storm","cyclops","beast","rogue","gambit","cable","bishop","colossus","phoenix",
    "thanos","ultron","loki","hela","dormamu","kang","galactus","doom","magneto","sinister",
    "venom","carnage","goblin","octopus","vulture","electro","sandman","rhino","scorpion","lizard",
    "kingpin","bullsey","punisher","elektra","daredvl","jessica","luke","cage","iron","fist",
    "defenders","shield","hydra","sword","hammer","widow","hawk","eye","ant","wasp",
    "vision","scarlet","witch","quickslv","falcon","winter","soldier","captain","america","marvel",
    "dc","warner","disney","pixar","illumin","laika","ghibli","toei","sunrise",
    "madhouse","bones","mappa","wit","trigger","clover","shaft","kyoani","ufotable","aniplex",
    "funimati","crunchyr","netflix","hulu","amazon","hbo","showtime","starz","paramount","peacock",
    "apple","disney","espn","fox","cbs","nbc","abc","cw","fx","amc",
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
    "equateur","argentin","qatar","yemen","jordanie","israel","nepal","bhoutan","chine","japon",
    "coree","taiwan","laos","inde","pakistan","iran","irak","oman","syrie","koweit",
    "brunei","malaisie","vietnam","myanmar","thailan","rwanda","burundi","libye","senegal","zimbabwe",
    "botswana","namibie","samoa","tonga","fidji","vanuatu","nauru","tuvalu","kiribati","palau",
    "paris","londres","berlin","madrid","rome","vienne","prague","budapest","varsovie","moscou",
    "tokyo","seoul","pekin","shanghai","hongkong","singapur","bangkok","hanoi","jakarta","manille",
    "sydney","melbourn","auckland","dubai","abou","dhabi","doha","riyad","le","caire",
    "nairobi","lagos","accra","dakar","tunis","alger","rabat","casa","marrakch","fes",
    "new","york","los","angeles","chicago","houston","phoenix","philadel","san","antonio",
    "san","diego","dallas","san","jose","austin","jacksonv","columbus","charlotte","seattle",
    "denver","boston","detroit","nashvill","portland","vegas","memphis","baltimore","milwauke",
    "plage","montagne","desert","foret","jungle","savane","toundra","glacier","volcan","canyon",
    "cascade","lac","riviere","fleuve","ocean","mer","ile","archipel","peninsul","isthme",
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
    "perche","anguille","crabe","homard","crevet","pieuvre","calamar","mouche","abeille","guepe",
    "fourmi","frelon","scarab","papillon","escargot","ver","grenouil","crapaud","cobra","python",
    "vipere","lezard","iguane","gecko","aigle","faucon","corbeau","pie","pigeon","dinde",
    "oie","canard","cygne","hibou","chouette","puma","lynx","belette","furet","rat",
    "souris","lapin","hamster","chameau","gazelle","gnou","impala","buffle","orang","lemur",
    "tapir","condor","orque","lamantin","narval","sardine","thon","maquerel","manta","murene",
    "tortue","caiman","alligat","crocodil","salamand","triton","axolotl","meduse","anemon","corail",
    "etoile","oursin","concombr","eponge","moule","huitre","palourde","coquill","bernacle","krill",
    "plancton","algue","varech","kelp","nori","wakame","spirulin","chlorell","euglene","amoeba",
    "panthere","jaguar","leopard","guepard","serval","ocelot","caracal","margay","oncille","jaguaro",
    "hermine","vison","loutre","blaireau","raton","moufette","civette","mangoust","suricate","hyene",
    "chacal","fennec","dhole","lycaon","coyote","tanuki","binturon","coati","kinkajou","olingo",
    "castor","marmotte","ecureuil","tamia","gerboise","chinchil","viscache","capybara","agouti","paca",
    "colibri","toucan","ara","cacatoes","perruche","calao","martin","huppe","guepier","rollier",
    "loriot","grive","merle","rouge","gorge","mesange","sitelle","grimper","pic","geai",
    "casse","noix","choucas","freux","corneill","grand","corbeau","chocard","crave","pie",
    "grieche","etournea","moineau","pinson","verdier","chardon","linotte","sizerin","bec","croise"
]'),

-- =============================================================================
-- METIERS & PROFESSIONS
-- =============================================================================
('Metiers',
'[
    "boulangr","plombier","pompier","docteur","dentiste","avocat","notaire","juge","infirmr","peintre",
    "sculpteu","acteur","auteur","editeur","journa","reporter","pilote","marin","soldat","gardien",
    "agent","serveur","cuisinier","patron","banquier","comptabl","analyste","dev","hacker","ingenieu",
    "technic","architec","designer","graphist","styliste","modeleur","vendeur","caissier","gerant","directeu",
    "coach","sportif","danseur","musicien","chanteur","dj","product","moniteur","prof","chercheu",
    "data","psy","medecin","chirurg","kine","soudeur","mecanic","artisan","menuisie","jardinier",
    "agricult","paysag","electric","veterina","astronau","capitain","chauffeu","conduct","forgeron","minier",
    "livreur","traiteur","boucher","charcut","pecheur","facteur","controle","auditeur","douanier","gendarme",
    "policier","magasini","retailer","sommeli","barman","barista","mixolog","maitre","hotel","concier",
    "recepti","portier","voiturer","bagagis","femme","chambre","gouverna","majord","butler","nanny",
    "babysit","educat","animat","mediateur","interpre","traduct","guide","conferen","formateur","tuteur",
    "mentor","conseill","consult","expert","special","generali","polyval","freelanc","interim","cdd",
    "cdi","stagiair","apprenti","alternnt","benevol","volontai","militant","activis","syndica","delegue",
    "represen","ambassad","attache","diplomt","consul","prefet","maire","depute","senateur","ministr",
    "secretr","greffier","huissier","commissr","procureu","magistrt","assesseu","juree","temoin","plaignt",
    "accuse","defendeu","partie","civile","victime","suspect","prevenu","inculpe","condamne","detenu",
    "gardien","prison","surveill","probatio","liberati","conditio","bracelet","electro","travaux","interet",
    "general","amende","sursis","reclus","criminel","correc","tribunal","cour","appel","cassatio",
    "europeen","internat","arbitrag","mediatio","concili","negocia","transact","accord","contrat","convent",
    "traite","charte","statut","reglemen","loi","decret","arrete","circula","directiv","recomand"
]'),

-- =============================================================================
-- COULEURS & ART
-- =============================================================================
('Couleurs',
'[
    "rouge","bleu","vert","jaune","noir","blanc","rose","violet","orange","cyan",
    "magenta","indigo","ocre","beige","marron","gris","saumon","olive","or","argent",
    "ambre","corail","ivoire","creme","pastel","marine","azur","turquois","sable","taupe",
    "rubis","opale","jade","ebene","perle","aqua","lilas","prune","fuchsia","moka",
    "amethys","topaze","emeraud","saphir","grenat","onyx","obsidien","quartz","cristal","diamant",
    "platine","bronze","cuivre","laiton","etain","acier","chrome","titane","alumini","zinc",
    "cobalt","nickel","manganes","mercure","plomb","fer","carbone","soufre","azote","oxygene",
    "neon","argon","helium","krypton","xenon","radon","fluor","chlore","brome","iode",
    "vermillo","carmin","cramois","bordeaux","grenat","cerise","frambois","fraise","tomate","brique",
    "rouille","cuivre","cannelle","caramel","miel","ambre","or","jaune","citron","paille",
    "ble","mais","moutarde","safran","curry","curcuma","gingembre","paprika","piment","cayenne",
    "corail","peche","abricot","melon","mandarin","orange","citrouil","carotte","tangerine","kumquat",
    "chartreu","lime","pistache","menthe","emeraude","jade","olive","avocat","kaki","mousse",
    "sapin","foret","bouteill","hunter","teal","canard","paon","petrole","ocean","marine",
    "cobalt","saphir","royal","electriq","ciel","azur","celeste","glacier","givre","poudre",
    "lavande","mauve","orchidee","violette","aubergin","prune","mure","cassis","raisin","vin",
    "bourgogn","cerise","sang","rubis","grenat","carmin","vermillo","ecarlate","pourpre","magenta",
    "fuchsia","rose","bonbon","barbe","papa","saumon","corail","peche","chair","nude",
    "ivoire","coquille","oeuf","creme","vanille","champagn","platine","argent","perle","nacre",
    "fumee","ardoise","anthrac","charbon","jais","encre","corbeau","minuit","abysse","profond"
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
    "tetris","pong","pacman","galaga","space","invader","asteroi","centipd","frogger","qbert",
    "digdug","joust","defender","tempest","missile","command","breakout","arkanoid","bubble","bobble",
    "contra","gradius","rtype","darius","thunder","force","raiden","strikers","metal","slug",
    "street","fighter","tekken","virtua","mortal","kombat","guilty","gear","blazblue","skullgr",
    "smash","bros","brawl","melee","ultimate","rivals","aether","brawlhal","multiver","nasb",
    "fortnite","pubg","apex","warzone","valorant","csgo","overwtch","rainbow","siege","tarkov",
    "rust","dayz","ark","conan","valheim","terraria","starbound","factorio","satisfac","dyson",
    "sphere","rimworld","dwarf","fortress","prison","architec","cities","skylines","simcity","tropico",
    "civiliza","humanknd","crusader","kings","europa","universa","stellari","victoria","imperatr","rome",
    "total","war","warhammr","age","empires","mythology","starcraft","warcraft","command","conquer",
    "suprem","comman","homewrld","sins","solar","empire","endless","space","legend","galactic",
    "masters","orion","stellaris","alpha","centauri","freeciv","openttd","simutran","locomotn","railroad",
    "tycoon","rollerco","theme","park","hospital","planet","zoo","coaster","jurassic","world",
    "evolution","frontier","elite","dangrous","star","citizen","no","man","sky","kerbal",
    "space","program","orbiter","simplerockets","spaceflig","simulator","universe","sandbox","galaxial","starsector",
    "distant","worlds","aurora","dominions","conquest","stars","master","orion","sword","stars"
]'),

-- =============================================================================
-- MAGIE & FANTAISIE
-- =============================================================================
('Fantaisie',
'[
    "dragon","licorne","phoenix","griffon","chimere","hydre","kraken","leviatha","behemoth","basilic",
    "cocatr","wyvern","drake","wyrm","serpent","lindworm","amphisb","ourobor","quetzal","coatl",
    "roc","simorgh","garuda","thunderb","firebird","oiseau","feu","glace","tonnerre","foudre",
    "eclair","tempete","ouragan","cyclone","tornade","tsunami","seisme","volcan","eruption","lave",
    "magma","obsidien","cristal","gemme","rubis","saphir","emeraud","diamant","topaze","amethys",
    "opale","jade","onyx","grenat","peridot","aigue","marine","turquois","lapis","lazuli",
    "malachit","jaspe","agate","calcedoi","cornalin","sardoine","heliodor","alexandr","tanzanit","zircon",
    "sorcier","mage","enchant","warlock","wizard","witch","shaman","druid","necro","pyro",
    "cryo","electro","hydro","geo","anemo","dendro","arcane","mystic","occult","esoteric",
    "hermetic","alchem","transmu","elixir","philtre","potion","breuvag","onguent","baume","catapla",
    "talisman","amulette","fetiche","totem","relique","artefac","grimoire","codex","manuscri","parche",
    "rune","glyphe","sigil","sceau","pentacle","hexagram","mandala","yantra","chakra","meridien",
    "aura","ether","mana","chi","ki","prana","qi","force","vital","energie",
    "cosmique","divin","celeste","infernal","demonia","angelic","seraphiq","cherubiq","archange","throne",
    "dominion","vertu","puissanc","principu","element","primord","chaos","ordre","lumiere","tenebre",
    "ombre","penombre","crepusc","aurore","zenith","nadir","horizon","infini","eternite","immortel",
    "elfe","nain","hobbit","orc","gobelin","troll","ogre","geant","titan","cyclope",
    "centaure","minotaur","satyre","faune","nymphe","dryade","naiade","nereide","sirene","ondine",
    "sylphe","gnome","salaman","lutin","farfadet","korigan","leprechn","brownie","pixie","sprite",
    "fee","banshee","specter","wraith","phantom","revenant","lich","vampire","loup","garou"
]'),

-- =============================================================================
-- ESPACE & ASTRONOMIE
-- =============================================================================
('Espace',
'[
    "soleil","lune","terre","mars","venus","mercure","jupiter","saturne","uranus","neptune",
    "pluton","ceres","eris","makemak","haumea","sedna","quaoar","orcus","varuna","ixion",
    "chaos","nix","hydra","charon","styx","kerbero","dysnomia","namaka","hiiaka","weywot",
    "asteroide","comete","meteore","bolide","meteorite","micromet","poussier","cosmique","rayonnement","solaire",
    "vent","couronne","chromos","photosph","tache","eruption","protube","filament","spicule","granule",
    "eclipse","occultati","transit","conjonct","oppositi","quadrat","sextile","trine","aspect","synodiqu",
    "sidereal","tropical","anomalis","periode","orbitale","revolutn","rotation","axial","precessi","nutatio",
    "galaxie","voie","lactee","androme","triangle","sculpteu","fourneau","eridan","orion","taureau",
    "gemeaux","cancer","lion","vierge","balance","scorpion","sagittar","capricor","verseau","poissons",
    "belier","nebuleus","amas","globular","ouvert","superama","filament","cosmiq","vide","mur",
    "grand","attractr","laniakea","persee","coma","virgo","centaure","hydra","fornax","horologe",
    "etoile","naine","geante","supergea","hypergea","pulsar","magnetar","quasar","blazar","seyfert",
    "nova","supernov","kilonova","hypernov","trou","noir","singular","horizon","ergosphe",
    "disque","accretio","jet","relativi","courbure","espace","temps","geodesiqu","tenseur","metrique",
    "einstein","hawking","penrose","wheeler","thorne","guth","linde","vilenkin","susskind","maldacen",
    "string","brane","bulk","multivers","bulle","inflatio","cosmolog","big","bang","crunch",
    "rip","freeze","bounce","cyclic","ekpyrot","steady","state","tired","light","plasma",
    "matiere","noire","energie","sombre","constnte","cosmolog","hubble","redshift","blueshift","doppler",
    "parallax","parsec","annee","lumiere","unite","astrono","rayon","solaire","masse",
    "magnitude","absolue","spectral","classe","russell","sequence","principa","branche"
]'),

-- =============================================================================
-- MYTHOLOGIE & LEGENDES
-- =============================================================================
('Mythes',
'[
    "zeus","hera","poseidon","hades","athena","apollon","artemis","aphrodit","ares","hephais",
    "hermes","dionysos","demeter","hestia","persepon","eros","pan","morphee","hypnos","thanatos",
    "nemesis","nike","tyche","hecate","iris","helios","selene","eos","eole","borée",
    "zephyr","notos","euros","triton","protee","nereus","amphitr","thetis","galatea","scylla",
    "charybde","sirenes","cyclopes","centaure","minotaur","meduse","gorgones","echidna","typhon","cerbere",
    "chimere","sphinx","hydre","nemee","erymant","cretois","stymphal","augias","hippolyt","geryon",
    "hesperid","atlas","promethee","epimethe","pandore","deucalio","pyrrha","orphee","eurydice","hercule",
    "achille","hector","ulysse","agamemn","menelas","paris","helene","cassandr","priam","hecube",
    "andromaq","enee","didon","romulus","remus","numa","tarquin","brutus","lucretia","horatius",
    "cincinna","camillus","fabius","scipion","caton","cesar","auguste","tibere","caligula","claude",
    "odin","thor","loki","freya","frigg","balder","tyr","heimdall","njord","frey",
    "skadi","idun","bragi","forseti","vidar","vali","ull","hoenir","mimir","kvasir",
    "fenrir","jormung","hel","sleipnir","huginn","muninn","geri","freki","ratatosk","nidhogg",
    "yggdrasi","bifrost","asgard","midgard","jotunhei","niflheim","muspelhe","vanaheim","alfheim","svartalf",
    "helheim","ragnarok","valhalla","fimbulve","ginnunga","audhumla","ymir","buri","bor","bestla",
    "ra","osiris","isis","horus","seth","anubis","thot","maat","nephthys","hathor",
    "sekhmet","bastet","sobek","khnum","ptah","amon","aton","nut","geb","shu",
    "tefnut","apep","ammit","bennu","scarab","ankh","djed","oudjat","cartouche","hierogly",
    "pharaon","pyramide","sphinx","obelisqu","temple","mastaba","sarcoph","momie","canope","papyrus",
    "hieropha","scribe","vizir","nome","delta","cataract","inondati","nilometre","shadouf","chadouf"
]')

ON CONFLICT (theme) DO UPDATE SET words = EXCLUDED.words;