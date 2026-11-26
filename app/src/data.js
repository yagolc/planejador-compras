// Dados portados do protótipo web (prototipo/index.html). Preços: tabela precos/precos_medios_v1.csv
// Corredores na ordem em que se anda num supermercado típico (suposição: cada loja tem a sua)
const CATS=['Hortifruti','Padaria','Carnes, peixes e ovos','Laticínios','Grãos e massas','Mercearia'];
// [id, nome, categoria, embalagens [[gramas, preço, rótulo]], kcal/100g, tags, fonte p/e, passo do granel em g]
// Itens a granel: uma "embalagem" [1000, preço/kg] e o passo mínimo de compra.
const RAW=[
['tomate','Tomate','Hortifruti',[[1000,9.5]],18,'','p',250],
['cebola','Cebola','Hortifruti',[[1000,8.36]],40,'','p',250],
['alho','Alho','Hortifruti',[[1000,30.95]],150,'','p',100],
['cenoura','Cenoura','Hortifruti',[[1000,5.9]],40,'','p',250],
['batata','Batata','Hortifruti',[[1000,7.75]],77,'','p',250],
['batata_doce','Batata-doce','Hortifruti',[[1000,5.9]],86,'','p',250],
['mandioca','Mandioca','Hortifruti',[[1000,5.5]],160,'','p',250],
['abobrinha','Abobrinha','Hortifruti',[[1000,6.9]],20,'','p',250],
['pimentao','Pimentão','Hortifruti',[[1000,9.9]],25,'','p',250],
['repolho','Repolho','Hortifruti',[[1000,4.5]],25,'','p',250],
['pepino','Pepino','Hortifruti',[[1000,5.9]],15,'','e',250],
['abacate','Abacate','Hortifruti',[[1000,9.9]],160,'','p',250],
['limao','Limão','Hortifruti',[[1000,5.5]],30,'','p',250],
['banana','Banana','Hortifruti',[[1000,6.5]],90,'','p',250],
['maca','Maçã','Hortifruti',[[1000,10.9]],52,'','p',250],
['laranja','Laranja','Hortifruti',[[1000,4.5]],47,'','p',250],
['gengibre','Gengibre','Hortifruti',[[1000,25.9]],80,'','e',100],
['alface','Alface','Hortifruti',[[250,3.5,'pé']],15,'','p'],
['brocolis','Brócolis','Hortifruti',[[400,6.9,'maço']],35,'','p'],
['cheiro','Cheiro-verde','Hortifruti',[[50,2.5,'maço']],25,'','p'],
['coentro','Coentro','Hortifruti',[[50,2.5,'maço']],25,'','e'],
['frango','Peito de frango','Carnes, peixes e ovos',[[1000,19.9]],160,'carne','e',250],
['carne_moida','Carne moída (patinho)','Carnes, peixes e ovos',[[1000,42.9]],220,'carne','e',250],
['linguica','Linguiça fresca','Carnes, peixes e ovos',[[1000,24.36]],300,'carne','p',250],
['salmao','Salmão','Carnes, peixes e ovos',[[1000,89.9]],210,'peixe','e',250],
['tilapia','Filé de tilápia','Carnes, peixes e ovos',[[1000,49.9,'pacote congelado 1 kg']],130,'peixe','e'],
['camarao','Camarão limpo','Carnes, peixes e ovos',[[400,34.9,'pacote congelado 400 g']],100,'frutos_mar','e'],
['atum','Atum em lata','Carnes, peixes e ovos',[[120,9.9,'lata 170 g']],190,'peixe','p'],
['ovos','Ovos','Carnes, peixes e ovos',[[600,10.1,'dúzia'],[1500,22.9,'bandeja 30 un']],145,'ovo','p'],
['tofu','Tofu','Carnes, peixes e ovos',[[400,14.9,'bandeja 400 g']],80,'soja','e'],
['leite','Leite integral','Laticínios',[[1000,5.71,'caixa 1 L']],60,'lactose laticinio','p'],
['leite_sl','Leite sem lactose','Laticínios',[[1000,6.5,'caixa 1 L']],60,'laticinio','e'],
['leite_veg','Bebida vegetal de soja','Laticínios',[[1000,8.9,'caixa 1 L']],40,'soja','e'],
['queijo','Queijo muçarela','Laticínios',[[1000,56.64]],300,'lactose laticinio','p',100],
['iogurte','Iogurte natural','Laticínios',[[170,3.5,'pote 170 g']],60,'lactose laticinio','p'],
['manteiga','Manteiga','Laticínios',[[200,12.9,'pote 200 g']],720,'lactose laticinio','p'],
['creme_leite','Creme de leite','Laticínios',[[200,4.2,'caixinha 200 g']],200,'lactose laticinio','e'],
['creme_leite_sl','Creme de leite sem lactose','Laticínios',[[200,6.9,'caixinha 200 g']],200,'laticinio','e'],
['arroz','Arroz branco','Grãos e massas',[[1000,5.49,'pacote 1 kg'],[5000,21.98,'pacote 5 kg']],360,'','p'],
['arroz_jp','Arroz japonês','Grãos e massas',[[1000,14.9,'pacote 1 kg']],355,'','e'],
['feijao','Feijão carioca','Grãos e massas',[[1000,8.27,'pacote 1 kg']],330,'','p'],
['feijao_preto','Feijão preto','Grãos e massas',[[1000,8.5,'pacote 1 kg']],330,'','e'],
['pipoca','Milho de pipoca','Grãos e massas',[[500,5.5,'pacote 500 g']],375,'','e'],
['lentilha','Lentilha','Grãos e massas',[[500,8.9,'pacote 500 g']],350,'','e'],
['grao','Grão-de-bico','Grãos e massas',[[500,9.9,'pacote 500 g']],360,'','e'],
['macarrao','Macarrão espaguete com ovos','Grãos e massas',[[500,3.45,'pacote 500 g']],370,'gluten ovo','p'],
['macarrao_arroz','Macarrão de arroz','Grãos e massas',[[500,12.9,'pacote 500 g']],360,'','e'],
['tortilla','Tortilha de trigo','Grãos e massas',[[320,11.9,'pacote 8 un']],300,'gluten','e'],
['tortilla_milho','Tortilha de milho','Grãos e massas',[[300,13.9,'pacote 10 un']],220,'','e'],
['biscoito','Biscoito água e sal','Padaria',[[200,3.12,'pacote 200 g']],430,'gluten','p'],
['pao','Pão de forma','Padaria',[[500,7.04,'pacote 500 g']],250,'gluten','p'],
['tapioca','Goma de tapioca','Padaria',[[500,6.9,'pacote 500 g']],240,'','e'],
['oleo','Óleo de soja','Mercearia',[[900,7.86,'garrafa 900 ml']],880,'','p'],
['azeite','Azeite','Mercearia',[[500,34.9,'garrafa 500 ml']],880,'','e'],
['sal','Sal','Mercearia',[[1000,3.2,'pacote 1 kg']],0,'','p'],
['acucar','Açúcar','Mercearia',[[1000,4.9,'pacote 1 kg'],[5000,17.78,'pacote 5 kg']],400,'','p'],
['cafe','Café em pó','Mercearia',[[500,24.4,'pacote 500 g']],0,'','p'],
['molho_tomate','Molho de tomate','Mercearia',[[300,2.9,'sachê 300 g']],40,'','e'],
['milho','Milho verde','Mercearia',[[120,4.5,'lata 170 g']],90,'','p'],
['shoyu','Shoyu','Mercearia',[[150,6.9,'frasco 150 ml']],60,'gluten soja','e'],
['shoyu_sg','Shoyu sem glúten (tamari)','Mercearia',[[150,14.9,'frasco 150 ml']],60,'soja','e'],
['leite_coco','Leite de coco','Mercearia',[[200,4.9,'vidro 200 ml']],180,'','e'],
['curry','Curry em pó','Mercearia',[[30,5.9,'pote 30 g']],0,'','e'],
['cominho','Cominho','Mercearia',[[30,4.5,'pote 30 g']],0,'','e'],
['amendoim','Amendoim torrado','Mercearia',[[500,11.9,'pacote 500 g']],570,'amendoim','e'],
['nori','Alga nori','Mercearia',[[25,12.9,'pacote 10 folhas']],0,'','e'],
['vinagre_arroz','Vinagre de arroz','Mercearia',[[300,8.9,'garrafa 300 ml']],0,'','e'],
];
// Fator regional: custo da cesta DIEESE out/2026 na capital ÷ custo em SP (R$ 951)
// Ceará: preços médios da cesta DIEESE de Fortaleza, out/2026 (O POVO, 11/11/2026). Quixadá usa Fortaleza até termos dados do interior.
const CE={arroz:[6.49,28.35],feijao:[8.76],leite:[7.54],tomate:[12.59],cafe:[30.4],banana:[5.8],acucar:[4.2,18.45],oleo:[9.04],manteiga:[14.44],carne_moida:[46.42]};
const REG=[['QXD','Quixadá (CE)',822.70/951.37,CE],['FOR','Fortaleza (CE)',822.70/951.37,CE],['SP','São Paulo',1,null],['BH','Belo Horizonte',811/951,null],['DF','Brasília',811/951,null],['PE','Recife',706/951,null],['BA','Salvador',678/951,null]];
const SUBS={macarrao:['macarrao_arroz'],tortilla:['tortilla_milho'],shoyu:['shoyu_sg'],pao:['tapioca'],leite:['leite_sl','leite_veg'],creme_leite:['creme_leite_sl','leite_coco'],manteiga:['oleo']};
const MINOR=40; // até 40 g por porção o ingrediente é "de apoio" e pode sair da receita
const RESTR=[['gluten','Sem glúten',['gluten']],['lactose','Sem lactose',['lactose']],['veg','Vegetariano',['carne','peixe','frutos_mar']],['vegano','Vegano',['carne','peixe','frutos_mar','ovo','laticinio']],['mar','Alergia a frutos do mar',['frutos_mar']],['peixe','Alergia a peixe',['peixe']],['amendoim','Alergia a amendoim',['amendoim']],['ovo','Alergia a ovo',['ovo']],['soja','Alergia a soja',['soja']]];
const CUIS=['Brasileira','Italiana','Mexicana','Asiática','Japonesa','Indiana','Árabe'];
const DIS_QUICK=['cebola','alho','coentro','pimentao','abobrinha','brocolis','tofu','abacate','pepino','linguica','salmao','camarao'];
const COOK_BASE=['arroz','arroz_jp','feijao','feijao_preto','lentilha','grao','macarrao','macarrao_arroz','batata','batata_doce','mandioca','pao','tapioca','banana','tortilla','tortilla_milho'];
const PANTRYISH=new Set(['sal','oleo','azeite']);
const RECIPES=[
['Arroz, feijão e frango grelhado','Brasileira',{arroz:80,feijao:60,frango:150,cebola:20,alho:5,oleo:10,sal:3,alface:40,tomate:60},'Cozinhe o feijão na pressão. Refogue alho e cebola no óleo e faça o arroz. Tempere o frango com sal e alho e grelhe. Sirva com salada de alface e tomate.'],
['Strogonoff de frango','Brasileira',{frango:150,creme_leite:50,molho_tomate:40,cebola:30,alho:5,arroz:80,batata:120,oleo:15,sal:2},'Doure o frango em cubos com cebola e alho. Junte o molho de tomate e cozinhe 10 min. Desligue o fogo e misture o creme de leite. Sirva com arroz e batata assada em palitos.'],
['Feijoada simples','Brasileira',{feijao_preto:90,linguica:120,cebola:30,alho:6,repolho:60,arroz:80,oleo:5,sal:2},'Deixe o feijão de molho. Doure a linguiça em rodelas, junte cebola, alho, o feijão e água e cozinhe na pressão por 35 min. Refogue o repolho fatiado fino. Sirva com arroz.'],
['Escondidinho de carne moída','Brasileira',{carne_moida:120,mandioca:220,cebola:30,alho:5,manteiga:10,queijo:30,leite:50,sal:2,oleo:5},'Cozinhe a mandioca e amasse com manteiga e leite. Refogue a carne com cebola e alho. Monte: carne embaixo, purê em cima, queijo por cima. Leve ao forno até gratinar.'],
['Omelete com arroz e salada','Brasileira',{ovos:120,tomate:70,cebola:20,arroz:80,alface:40,cheiro:5,oleo:8,sal:2},'Bata os ovos com sal e cheiro-verde. Junte tomate e cebola picados e frite em frigideira untada, virando uma vez. Sirva com arroz e salada.'],
['Tilápia assada com batatas','Brasileira',{tilapia:150,batata:220,limao:20,azeite:10,alho:5,cebola:30,sal:3},'Tempere os filés com limão, alho e sal. Fatie batata e cebola, arrume na assadeira com azeite e asse 20 min. Coloque o peixe por cima e asse mais 15 min.'],
['Sopa de legumes com frango','Brasileira',{frango:100,batata:130,cenoura:70,abobrinha:70,cebola:30,alho:5,oleo:5,sal:3},'Refogue cebola e alho, junte o frango em cubos e doure. Adicione batata e cenoura e cubra com água. Cozinhe 20 min, junte a abobrinha e cozinhe mais 5 min.'],
['Atum com batata-doce e salada','Brasileira',{atum:100,batata_doce:220,tomate:60,cebola:20,alface:40,azeite:8,limao:10,sal:2},'Asse ou cozinhe a batata-doce em rodelas. Misture o atum com tomate, cebola, azeite e limão. Sirva sobre a alface com a batata-doce.'],
['Camarão ao alho com arroz','Brasileira',{camarao:120,alho:10,azeite:10,arroz:80,limao:15,cheiro:5,tomate:50,sal:2},'Tempere o camarão com limão e sal. Doure bastante alho no azeite, junte camarão e tomate e salteie 3 a 4 min. Finalize com cheiro-verde e sirva com arroz.'],
['Espaguete à bolonhesa','Italiana',{macarrao:110,carne_moida:100,molho_tomate:90,cebola:25,alho:5,cenoura:30,oleo:5,sal:2},'Refogue cebola, alho e cenoura ralada, junte a carne e doure. Adicione o molho e cozinhe 15 min. Cozinhe o macarrão em água com sal e misture ao molho.'],
['Macarrão alho e óleo com brócolis','Italiana',{macarrao:110,brocolis:130,alho:10,azeite:15,sal:2},'Cozinhe o macarrão e, nos últimos 3 min, junte o brócolis na mesma água. Doure alho laminado no azeite e misture tudo.'],
['Risoto de abobrinha','Italiana',{arroz:90,abobrinha:150,queijo:30,manteiga:10,cebola:25,alho:5,oleo:5,sal:2},'Refogue cebola e alho, junte o arroz e mexa 1 min. Vá adicionando água quente e mexendo por uns 18 min. Junte a abobrinha ralada no fim e termine com manteiga e queijo.'],
['Tacos de carne','Mexicana',{tortilla:100,carne_moida:120,tomate:60,cebola:30,alface:30,limao:15,cominho:1,coentro:3,oleo:5,sal:2},'Refogue a carne com cebola, cominho e sal. Pique tomate, cebola e coentro com limão. Aqueça as tortilhas e recheie com carne, alface e o vinagrete.'],
['Burrito de feijão e queijo','Mexicana',{tortilla:100,feijao_preto:70,arroz:50,milho:50,queijo:30,tomate:50,pimentao:40,cominho:1,oleo:5,sal:2},'Cozinhe o feijão e amasse levemente com cominho. Refogue pimentão e milho. Recheie as tortilhas com arroz, feijão, legumes, tomate e queijo, enrole e doure.'],
['Chili com carne','Mexicana',{carne_moida:100,feijao_preto:60,molho_tomate:80,cebola:30,pimentao:50,cominho:2,alho:5,arroz:80,oleo:5,sal:2},'Doure a carne com cebola, alho e pimentão. Junte cominho, molho de tomate e o feijão cozido. Cozinhe 20 min em fogo baixo e sirva com arroz.'],
['Bowl mexicano com guacamole','Mexicana',{arroz:80,feijao_preto:60,abacate:100,milho:50,tomate:50,cebola:20,limao:15,coentro:3,sal:2},'Amasse o abacate com limão, cebola, tomate, coentro e sal. Monte a tigela com arroz, feijão, milho e o guacamole por cima.'],
['Yakisoba de frango','Asiática',{macarrao:100,frango:120,brocolis:60,cenoura:50,repolho:60,shoyu:20,gengibre:3,oleo:10},'Cozinhe o macarrão. Salteie o frango em tiras em óleo bem quente, depois cenoura, brócolis e repolho. Junte o macarrão, o shoyu e o gengibre ralado.'],
['Frango xadrez','Asiática',{frango:150,pimentao:60,cebola:40,amendoim:20,shoyu:20,arroz:80,oleo:10,gengibre:3},'Doure o frango em cubos. Junte cebola e pimentão em cubos e salteie rápido. Adicione shoyu, gengibre e um pouco de água; finalize com amendoim. Sirva com arroz.'],
['Arroz frito com ovo e legumes','Asiática',{arroz:90,ovos:60,cenoura:50,milho:30,cheiro:5,shoyu:15,oleo:10},'Use arroz já cozido, de preferência do dia anterior. Mexa os ovos e reserve. Salteie cenoura e milho, junte arroz, ovo e shoyu. Finalize com cheiro-verde.'],
['Tofu com legumes ao gengibre','Asiática',{tofu:150,brocolis:80,cenoura:50,gengibre:5,alho:5,shoyu:15,arroz:80,oleo:10},'Seque o tofu e doure em cubos. Salteie alho, gengibre, cenoura e brócolis. Junte o tofu e o shoyu e sirva com arroz.'],
['Sushi bowl de salmão','Japonesa',{arroz_jp:100,salmao:100,pepino:50,abacate:40,nori:3,vinagre_arroz:10,acucar:4,shoyu:15,sal:1},'Cozinhe o arroz japonês e tempere com vinagre de arroz, açúcar e sal. Monte com salmão em cubos, pepino, abacate e nori picada. Regue com shoyu.'],
['Oyakodon (frango com ovo)','Japonesa',{arroz_jp:100,frango:130,ovos:60,cebola:50,shoyu:20,acucar:5,cheiro:3},'Cozinhe cebola fatiada com shoyu, açúcar e um pouco de água. Junte o frango em cubos. Despeje os ovos batidos, tampe por 1 min e sirva sobre o arroz.'],
['Sushi bowl de tofu','Japonesa',{arroz_jp:100,tofu:100,pepino:60,cenoura:40,abacate:60,nori:3,vinagre_arroz:10,acucar:4,shoyu:15},'Tempere o arroz japonês com vinagre e açúcar. Doure o tofu com um pouco de shoyu. Monte com pepino, cenoura ralada, abacate e nori.'],
['Frango teriyaki','Japonesa',{frango:150,shoyu:25,acucar:10,gengibre:3,alho:4,arroz_jp:100,brocolis:60,oleo:5},'Doure o frango. Junte shoyu, açúcar, gengibre, alho e um pouco de água e reduza até virar calda. Sirva com arroz e brócolis cozido.'],
['Curry de grão-de-bico','Indiana',{grao:80,leite_coco:60,tomate:80,cebola:40,alho:5,gengibre:3,curry:3,arroz:80,oleo:10,sal:2},'Deixe o grão de molho e cozinhe na pressão. Refogue cebola, alho, gengibre e curry, junte tomate e o grão. Adicione leite de coco e cozinhe 10 min. Sirva com arroz.'],
['Dal de lentilha','Indiana',{lentilha:80,tomate:60,cebola:30,alho:5,gengibre:3,curry:3,arroz:80,oleo:10,sal:2},'Refogue cebola, alho, gengibre e curry. Junte lentilha, tomate e água e cozinhe 25 min até ficar cremoso. Sirva com arroz.'],
['Frango ao curry','Indiana',{frango:150,leite_coco:60,curry:3,cebola:30,alho:5,arroz:80,oleo:10,sal:2},'Doure o frango em cubos. Junte cebola, alho e curry. Adicione leite de coco e cozinhe 10 min. Sirva com arroz.'],
['Kafta com arroz e salada','Árabe',{carne_moida:130,cebola:25,cominho:1,tomate:60,pepino:60,arroz:70,limao:10,azeite:5,sal:2},'Misture a carne com cebola ralada, cominho e sal e modele em rolinhos. Grelhe ou asse. Sirva com arroz e salada de tomate e pepino com limão e azeite.'],
['Homus com legumes assados','Árabe',{grao:70,azeite:15,limao:15,alho:5,batata_doce:150,cenoura:80,abobrinha:80,sal:2},'Bata o grão-de-bico cozido com alho, limão, azeite, sal e um pouco de água. Asse batata-doce, cenoura e abobrinha em pedaços com azeite. Sirva juntos.'],
['Mujadara (arroz com lentilha)','Árabe',{lentilha:60,arroz:60,cebola:60,oleo:15,cominho:1,tomate:50,pepino:50,limao:10,sal:2},'Cozinhe a lentilha até ficar al dente, junte o arroz e água e termine juntos. Caramelize bastante cebola no óleo e coloque por cima. Sirva com salada de tomate e pepino.'],
].map(([n,c,ing,s],i)=>({id:i,n,c,ing,s}));
const SNACKS=[['Maçã',{maca:150}],['Pipoca',{pipoca:30,oleo:5,sal:1}],['Banana',{banana:120}],['Iogurte natural',{iogurte:170}],['Laranja',{laranja:180}],['Biscoito água e sal',{biscoito:30}],['Amendoim',{amendoim:30}],['Ovo cozido',{ovos:100}],['Cenoura em palitos',{cenoura:100}]];
const OUT_KCAL=700; // suposição: uma refeição fora de casa equivale a ~700 kcal
const BREAKFAST={pao:50,leite:200,banana:100,manteiga:5,cafe:10};
const COOK=['arroz','arroz_jp','feijao','feijao_preto','lentilha','grao','macarrao','macarrao_arroz','batata','batata_doce','mandioca'];
const CHOP=['cebola','alho','cenoura','pimentao','abobrinha','brocolis','repolho','tomate','pepino','gengibre'];

// Proteína, carboidrato e gordura (g por 100 g), valores aproximados da tabela TACO/USDA
const MAC={tomate:[1.1,3.1,.2],cebola:[1.7,8.9,.1],alho:[7,24,.2],cenoura:[1.3,7.7,.2],batata:[1.8,14.7,0],batata_doce:[1.3,28,.1],mandioca:[1.1,36,.3],abobrinha:[1.1,3,.2],pimentao:[1.1,5,.2],repolho:[1.4,4.5,.1],pepino:[.9,2,0],abacate:[1.2,6,8.4],limao:[.9,11,.1],banana:[1.4,24,.1],maca:[.3,15,0],laranja:[1,11,.1],gengibre:[1.8,18,.8],alface:[1.4,2.4,.2],brocolis:[3.6,4,.3],cheiro:[3,5,.5],coentro:[2.1,4,.5],
 frango:[32,0,2.5],carne_moida:[26,0,12],linguica:[16,0,26],salmao:[20,0,13],tilapia:[26,0,3],camarao:[20,0,1],atum:[26,0,8],ovos:[13,1.1,9.5],tofu:[8.5,2,4.5],
 leite:[3.2,4.7,3.2],leite_sl:[3.2,4.7,3.2],leite_veg:[3,2,1.8],queijo:[23,3,25],manteiga:[.4,0,82],creme_leite:[2.2,4.5,20],creme_leite_sl:[2.2,4.5,20],iogurte:[4,5.5,3],
 arroz:[7.2,79,.3],arroz_jp:[6.5,79,.5],feijao:[20,61,1.3],feijao_preto:[21,58,1.3],lentilha:[23,62,.8],grao:[21,61,5.4],macarrao:[12,73,2],macarrao_arroz:[6,80,.6],tortilla:[8,50,7],tortilla_milho:[5.7,45,2.8],pipoca:[10,70,4],pao:[9,49,3],tapioca:[.2,60,0],biscoito:[10,68,14],
 oleo:[0,0,100],azeite:[0,0,100],acucar:[0,100,0],molho_tomate:[1.3,7,.5],milho:[3,17,1],shoyu:[8,5,0],shoyu_sg:[8,5,0],leite_coco:[1.8,3,18],amendoim:[26,16,49]};
const PMSET=new Set(['frango','carne_moida','linguica','salmao','tilapia','camarao','atum','ovos','tofu','queijo','iogurte']);

export {CATS,RAW,CE,REG,SUBS,MINOR,RESTR,CUIS,DIS_QUICK,COOK_BASE,PANTRYISH,RECIPES,SNACKS,OUT_KCAL,BREAKFAST,COOK,CHOP,MAC,PMSET};
