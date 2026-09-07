/* ============================================================
   EnglishAI Tutor — Script principal
   - Voz masculina (Web Speech API)
   - Cámara y micrófono (getUserMedia + medidor de nivel)
   - Reconocimiento de voz (práctica de pronunciación)
   - Plan de 30 días (básico / intermedio / avanzado)
   - Progreso guardado en localStorage
   ============================================================ */
"use strict";

/* =================== ESTADO =================== */
const STORE_KEY = "englishai_tutor_v1";
const state = loadState();

function loadState(){
  try{
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if(s && s.level) return s;
  }catch(e){}
  return { level:null, completedDays:{}, points:0, studyMinutes:0, pronScores:[], activity:[], lastVisit:null, streak:0 };
}
function saveState(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

/* =================== CURRÍCULO: 30 DÍAS POR NIVEL =================== */
/* Cada día: tipo de clase, tema, descripción */
const CURRICULUM = {
  basico: [
    {t:"vocabulario",topic:"Saludos y presentaciones",desc:"Hello, my name is… — Preséntate con confianza."},
    {t:"gramatica",topic:"El verbo TO BE",desc:"I am / You are / He is — la base de todo."},
    {t:"escritura",topic:"Escribe tu presentación",desc:"Redacta 5 oraciones sobre ti en inglés."},
    {t:"audio",topic:"Números del 1 al 100",desc:"Aprende a escuchar y decir números."},
    {t:"vocabulario",topic:"Días, meses y fechas",desc:"¿Qué día es hoy? Say the date."},
    {t:"habla",topic:"Preguntas personales",desc:"¿Dónde vives? ¿Qué te gusta? Practica en voz alta."},
    {t:"gramatica",topic:"Artículos A / AN / THE",desc:"Cuándo usar cada artículo sin pensar."},
    {t:"audio",topic:"El alfabeto en inglés",desc:"Deletrea tu nombre y correo con claridad."},
    {t:"escritura",topic:"Dictado: frases simples",desc:"Escribe lo que escuchas del tutor."},
    {t:"vocabulario",topic:"Colores, familiares y objetos",desc:"Describe lo que ves a tu alrededor."},
    {t:"gramatica",topic:"Presente simple",desc:"I work, She works — rutinas diarias."},
    {t:"lectura",topic:"Lee: My daily routine",desc:"Comprende un texto corto sobre rutinas."},
    {t:"habla",topic:"Tu rutina diaria",desc:"Cuéntale al tutor tu día a día."},
    {t:"vocabulario",topic:"La casa y el aula",desc:"classroom, laptop, desk… vocabulario técnico básico."},
    {t:"audio",topic:"Escucha: instrucciones de clase",desc:"Open your book. Listen carefully."},
    {t:"escritura",topic:"Escribe sobre tu familia",desc:"5 oraciones describiendo a tu familia."},
    {t:"gramatica",topic:"Preguntas con DO / DOES",desc:"Do you study? Does she work?"},
    {t:"habla",topic:"En la cafetería",desc:"Pide comida y bebida en inglés."},
    {t:"vocabulario",topic:"El tiempo y las estaciones",desc:"sunny, rainy, hot, cold…"},
    {t:"lectura",topic:"Lee: A short email",desc:"Entiende correos sencillos en inglés."},
    {t:"audio",topic:"Escucha: horarios y horas",desc:"What time is it? It's half past nine."},
    {t:"gramatica",topic:"Hay / There is / There are",desc:"There is a lab. There are 20 students."},
    {t:"escritura",topic:"Dictado: párrafo corto",desc:"Dictado nivel medio sobre la escuela."},
    {t:"habla",topic:"Describir tu ciudad",desc:"Habla 1 minuto sobre tu ciudad."},
    {t:"vocabulario",topic:"Profesiones y estudios",desc:"engineer, technician, developer…"},
    {t:"gramatica",topic:"Pasado simple: verbos comunes",desc:"I studied, We worked yesterday."},
    {t:"lectura",topic:"Lee: My first day at college",desc:"Un texto del pasado con comprensión."},
    {t:"escritura",topic:"Escribe sobre tu fin de semana",desc:"8 oraciones en pasado simple."},
    {t:"audio",topic:"Escucha: conversación telefónica",desc:"Hello? Can I speak to…?"},
    {t:"habla",topic:"Examen final de conversación",desc:"Charla de 3 minutos con el tutor. ¡Día 30! 🎉"}
  ],
  intermedio: [
    {t:"vocabulario",topic:"Tecnología y dispositivos",desc:"hardware, software, server, device…"},
    {t:"gramatica",topic:"Presente continuo vs simple",desc:"I am working vs I work — la diferencia clave."},
    {t:"escritura",topic:"Escribe un correo formal",desc:"Estructura de emails profesionales."},
    {t:"audio",topic:"Escucha: descripción de un proceso",desc:"Comprende pasos técnicos en audio."},
    {t:"vocabulario",topic:"Laboratorio y herramientas",desc:"measure, calibrate, sample, equipment…"},
    {t:"habla",topic:"Explica tu especialidad",desc:"Describe tu carrera técnica en 1 minuto."},
    {t:"gramatica",topic:"Pasado continuo y Pasado simple",desc:"While I was testing, the power went out."},
    {t:"audio",topic:"Escucha: reunión de equipo",desc:"Follow a stand-up meeting in English."},
    {t:"escritura",topic:"Dictado: párrafo técnico",desc:"Dictado con vocabulario de ingeniería."},
    {t:"vocabulario",topic:"Verbos de proceso técnico",desc:"install, configure, debug, deploy…"},
    {t:"gramatica",topic:"Futuro: WILL y GOING TO",desc:"We will deploy it. We are going to test."},
    {t:"lectura",topic:"Lee: Manual rápido",desc:"Lee un extracto de manual técnico."},
    {t:"habla",topic:"Presenta un proyecto",desc:"Estructura: problem → solution → result."},
    {t:"audio",topic:"Escucha: números y datos",desc:"Porcentajes, decimales y unidades."},
    {t:"escritura",topic:"Escribe un reporte corto",desc:"Reporta resultados de un experimento."},
    {t:"vocabulario",topic:"Seguridad y riesgos",desc:"hazard, warning, PPE, caution…"},
    {t:"gramatica",topic:"Condicional tipo 1 y 2",desc:"If the sensor fails, the alarm sounds."},
    {t:"habla",topic:"Entrevista de práctica",desc:"Responde preguntas de trabajo técnico."},
    {t:"audio",topic:"Escucha: instrucciones de seguridad",desc:"Comprende advertencias y protocolos."},
    {t:"escritura",topic:"Escribe instrucciones paso a paso",desc:"How to… — imperativos técnicos."},
    {t:"vocabulario",topic:"Gráficos y tendencias",desc:"increase, decrease, stable, peak…"},
    {t:"gramatica",topic:"Voz pasiva técnica",desc:"The sample was analyzed. The bug was fixed."},
    {t:"lectura",topic:"Lee: Artículo técnico",desc:"Comprensión de artículo especializado."},
    {t:"habla",topic:"Debate: tecnología y ética",desc:"Opina: Should AI replace technicians?"},
    {t:"audio",topic:"Escucha: podcast técnico",desc:"Notas clave de un podcast de ingeniería."},
    {t:"escritura",topic:"Dictado: lenguaje formal",desc:"Dictado avanzado de documentación."},
    {t:"vocabulario",topic:"Academia y certificaciones",desc:"degree, diploma, certification, GPA…"},
    {t:"gramatica",topic:"Reported speech básico",desc:"He said the test passed. She told me to wait."},
    {t:"lectura",topic:"Lee: Caso de estudio",desc:"Analiza un caso técnico real."},
    {t:"habla",topic:"Examen final: presentación técnica",desc:"Presenta 3 minutos. ¡Día 30! 🎉"}
  ],
  avanzado: [
    {t:"vocabulario",topic:"Jerga de la industria 4.0",desc:"IoT, automation, scalability, uptime…"},
    {t:"gramatica",topic:"Condicionales avanzados",desc:"Mixed conditionals en contextos técnicos."},
    {t:"escritura",topic:"Redacta un abstract técnico",desc:"Estructura IMRaD en 150 palabras."},
    {t:"audio",topic:"Escucha: conferencia técnica",desc:"Sigue una charla con acento nativo."},
    {t:"vocabulario",topic:"Investigación y papers",desc:"hypothesis, peer review, methodology…"},
    {t:"habla",topic:"Defiende tu tesis",desc:"Argumenta y responde objeciones."},
    {t:"gramatica",topic:"Inversión y énfasis",desc:"Not only did the test fail, but…"},
    {t:"audio",topic:"Escucha: negociación técnica",desc:"Contraofertas, plazos y especificaciones."},
    {t:"escritura",topic:"Dictado: terminología avanzada",desc:"Dictado con jerga especializada."},
    {t:"vocabulario",topic:"Finanzas y proyectos",desc:"budget, ROI, milestone, deliverable…"},
    {t:"gramatica",topic:"Modales avanzados",desc:"The system must / should / could be updated."},
    {t:"lectura",topic:"Lee: whitepaper técnico",desc:"Extrae ideas clave de un documento técnico."},
    {t:"habla",topic:"Pitchea una innovación",desc:"Persuade al tutor con tu propuesta."},
    {t:"audio",topic:"Escucha: acentos variados",desc:"Adaptarte a British, American y Australian."},
    {t:"escritura",topic:"Escribe un paper (extracto)",desc:"Redacción académica avanzada."},
    {t:"vocabulario",topic:"Legal y compliance",desc:"liability, compliance, warranty, NDA…"},
    {t:"gramatica",topic:"Estilo indirecto complejo",desc:"Reporta especificaciones y requerimientos."},
    {t:"habla",topic:"Simulación: junta directiva",desc:"Presenta métricas a dirección."},
    {t:"audio",topic:"Escucha: llamada con cliente",desc:"Maneja quejas y resuelve problemas."},
    {t:"escritura",topic:"Dictado: lenguaje legal-técnico",desc:"Cláusulas y condiciones en inglés."},
    {t:"vocabulario",topic:"Liderazgo y equipos",desc:"delegate, mentor, KPI, stakeholder…"},
    {t:"gramatica",topic:"Concordancia avanzada y precisión",desc:"One of the tests WAS, Data IS/ARE…"},
    {t:"lectura",topic:"Lee: paper de investigación",desc:"Analiza metodología y resultados."},
    {t:"habla",topic:"Panel: preguntas difíciles",desc:"Responde con naturalidad bajo presión."},
    {t:"audio",topic:"Escucha: debate especializado",desc:"Identifica posturas y contraargumentos."},
    {t:"escritura",topic:"Escribe tu declaración profesional",desc:"Personal statement / cover letter."},
    {t:"vocabulario",topic:"Emerging tech 2026",desc:"quantum, edge computing, LLM ops…"},
    {t:"gramatica",topic:"Elegancia gramatical total",desc:"Refina tu estilo para sonar nativo."},
    {t:"lectura",topic:"Lee: informe anual corporativo",desc:"Sintetiza información ejecutiva."},
    {t:"habla",topic:"EXAMEN FINAL: defensa completa",desc:"30 días cumplidos. ¡Demuestra tu fluidez! 🎉"}
  ]
};

/* =================== BANCO DE LECCIONES (por tipo) =================== */
const LESSONS = {
  vocabulario: [
    {id:"voc1",title:"Tech Essentials I",desc:"20 palabras clave de tecnología.",level:"Básico",
     content:{type:"vocab",intro:"Domina estas palabras técnicas fundamentales. Escucha cada una y repite en voz alta.",
      words:[["laptop","computadora portátil"],["keyboard","teclado"],["screen","pantalla"],
             ["mouse","ratón"],["cable","cable"],["printer","impresora"],["software","software"],
             ["hardware","hardware"],["server","servidor"],["network","red"]] }},
    {id:"voc2",title:"Lab & Equipment",desc:"Vocabulario de laboratorio.",level:"Intermedio",
     content:{type:"vocab",intro:"Vocabulario esencial para entornos de laboratorio e ingeniería.",
      words:[["equipment","equipamiento"],["sample","muestra"],["measure","medir"],["calibrate","calibrar"],
             ["gauge","indicador"],["tool","herramienta"],["sensor","sensor"],["valve","válvula"],
             ["circuit","circuito"],["blueprint","plano"]] }},
    {id:"voc3",title:"Processes & Actions",desc:"Verbos de proceso técnico.",level:"Intermedio",
     content:{type:"vocab",intro:"Verbos que usan los técnicos e ingenieros todos los días.",
      words:[["install","instalar"],["configure","configurar"],["debug","depurar"],["test","probar"],
             ["deploy","desplegar"],["upgrade","actualizar"],["repair","reparar"],["assemble","ensamblar"],
             ["monitor","monitorear"],["optimize","optimizar"]] }},
    {id:"voc4",title:"Data & Trends",desc:"Cómo describir gráficos y datos.",level:"Avanzado",
     content:{type:"vocab",intro:"Lenguaje para presentaciones con datos.",
      words:[["increase","aumentar"],["decrease","disminuir"],["remain stable","permanecer estable"],
             ["peak","punto máximo"],["average","promedio"],["significant","significativo"],
             ["gradual","gradual"],["sharp","pronunciado"],["fluctuate","fluctuar"],["forecast","pronóstico"]] }},
  ],
  gramatica: [
    {id:"gr1",title:"Present Simple vs Continuous",desc:"¿Cuándo usar cada presente?",level:"Básico-Intermedio",
     content:{type:"quiz",intro:"Elige la opción correcta. El tutor te explicará cada respuesta.",
      questions:[
        {q:"She ___ in the lab every day.",opts:["work","works","working"],a:1,why:"Con 'she/he/it' el verbo lleva -s: works."},
        {q:"Look! The machine ___ .",opts:["smokes","is smoking","smoke"],a:1,why:"Acción que ocurre AHORA → presente continuo: is smoking."},
        {q:"Water ___ at 100°C.",opts:["boil","boils","boiling"],a:1,why:"Verdades generales → presente simple: boils."},
        {q:"They ___ a new prototype right now.",opts:["design","designs","are designing"],a:2,why:"'right now' → continuo: are designing."},
        {q:"My computer ___ very slowly these days.",opts:["runs","is running","run"],a:1,why:"Situación temporal ('these days') → continuo: is running."}
      ]}},
    {id:"gr2",title:"Passive Voice for Technicians",desc:"La voz pasiva en contexto técnico.",level:"Intermedio-Avanzado",
     content:{type:"quiz",intro:"La voz pasiva es clave en documentación técnica.",
      questions:[
        {q:"The report ___ yesterday.",opts:["wrote","was written","is writing"],a:1,why:"Pasado + objeto que recibe la acción → was written."},
        {q:"The data ___ automatically every hour.",opts:["backs up","is backed up","backing up"],a:1,why:"Hábito pasivo → is backed up."},
        {q:"The new software ___ next month.",opts:["will install","will be installed","installs"],a:1,why:"Futuro pasivo → will be installed."},
        {q:"This valve must ___ carefully.",opts:["handle","be handled","handled"],a:1,why:"Modal + pasivo → must be handled."},
        {q:"The samples have ___ to the lab.",opts:["sent","been sent","sended"],a:1,why:"Present perfect pasivo → have been sent."}
      ]}},
    {id:"gr3",title:"Conditionals 1 & 2",desc:"Si pasa esto, pasa lo otro.",level:"Intermedio",
     content:{type:"quiz",intro:"Practica condicionales con escenarios técnicos reales.",
      questions:[
        {q:"If the temperature rises, the alarm ___ .",opts:["sounds","will sound","would sound"],a:0,why:"Condicional 1: if + presente, presente/will. Ambas válidas, aquí 'sounds' es regla general."},
        {q:"If I ___ more time, I would optimize the code.",opts:["have","had","will have"],a:1,why:"Condicional 2: if + pasado → would. 'had'."},
        {q:"If you press this button, the machine ___ .",opts:["stops","would stop","stopped"],a:0,why:"Instrucciones generales → presente simple: stops."},
        {q:"If the server ___ down, we would lose data.",opts:["goes","went","will go"],a:1,why:"Condicional 2: if + pasado → went."},
        {q:"Unless you calibrate it, the results ___ reliable.",opts:["aren't","won't be","wouldn't be"],a:1,why:"'Unless you calibrate' = condicional 1 → won't be."}
      ]}},
  ],
  escritura: [
    {id:"wr1",title:"Write About Yourself",desc:"Redacción guiada: tu presentación.",level:"Básico",
     content:{type:"write",intro:"Escribe 4-6 oraciones presentándote. Usa: name, age, country, studies, hobby.",
      sample:"Hello! My name is Carlos. I am 22 years old. I am from Mexico. I study industrial engineering. I like technology and music.",
      keywords:["name","am","from","study","like"],minWords:12}},
    {id:"wr2",title:"Dictation Challenge",desc:"Escribe lo que escuchas.",level:"Intermedio",
     content:{type:"dictation",intro:"Presiona ▶ Escuchar. El tutor dictará una frase técnica dos veces. Escríbela exactamente.",
      sentences:["The technician repaired the machine this morning.",
                 "We tested the new software yesterday.",
                 "The engineer will install the sensor tomorrow.",
                 "Please send me the report before Friday.",
                 "The system works better after the update."]}},
    {id:"wr3",title:"Write a Technical Report",desc:"Reporte de resultados.",level:"Avanzado",
     content:{type:"write",intro:"Redacta un mini-reporte (5-7 oraciones) sobre un experimento o prueba. Usa pasado simple y conectores: first, then, finally, however.",
      sample:"First, we calibrated the equipment. Then, we ran three tests. The results were consistent. However, the second test showed a small error. Finally, we concluded that the sensor needs replacement.",
      keywords:["first","then","results","however","finally"],minWords:25}},
  ],
  audio: [
    {id:"au1",title:"Listening: Numbers",desc:"Identifica números en audio.",level:"Básico",
     content:{type:"listening",intro:"Escucha el número y selecciónalo. Entrena tu oído con cifras técnicas.",
      items:[["seventy-five",["75","57","15"]],["two hundred and forty",["240","204","420"]],
             ["one point five",["1.5","5.1","15"]],["thirty percent",["30%","13%","3%"]],
            ["one thousand two hundred",["1,200","12,000","120"]]] }},
    {id:"au2",title:"Listening: Instructions",desc:"Sigue instrucciones habladas.",level:"Intermedio",
     content:{type:"listening",intro:"Escucha la instrucción y elige lo que debes hacer.",
      items:[["Press the red button.",["Press the red button.","Turn off the power.","Open the valve."]],
             ["Write your name at the top.",["Write your name at the top.","Sign at the bottom.","Print the document."]],
             ["Wait for the green light.",["Wait for the green light.","Press start now.","Close the program."]],
             ["Save the file and close it.",["Save the file and close it.","Delete the file.","Rename the folder."]]] }},
    {id:"au3",title:"Listening: Accents",desc:"Números con acentos variados.",level:"Avanzado",
     content:{type:"listening",intro:"Escucha con atención: números y fechas con acento británico/americano.",
      items:[["the third of March",["March 3rd","March 13th","May 3rd"]],
            ["nineteen eighty-four",["1984","1894","1948"]],
            ["minus five degrees",["-5°","5°","-15°"]],
            ["fifty-five point two volts",["55.2 V","25.5 V","52.5 V"]]] }},
  ],
  habla: [
    {id:"sp1",title:"Pronunciation Lab",desc:"El tutor evalúa tu pronunciación.",level:"Todos",
     content:{type:"speak",intro:"Presiona el micrófono 🎙️ y lee la frase en voz alta. El tutor comparará lo que escuchó con la frase objetivo.",
      sentences:["The quick brown fox jumps over the lazy dog.",
                 "Please install the latest software update.",
                 "She sells sea shells by the seashore.",
                 "The technician measured the temperature twice.",
                 "How much wood would a woodchuck chuck?"]}},
    {id:"sp2",title:"Shadowing Practice",desc:"Repite inmediatamente tras el tutor.",level:"Intermedio",
     content:{type:"speak",intro:"Técnica shadowing: escucha cada frase y repítela de inmediato, imitando ritmo y tono.",
      sentences:["First, turn on the machine and wait thirty seconds.",
                 "The results were better than we expected.",
                 "Could you repeat that more slowly, please?",
                 "I would like to schedule a meeting for tomorrow.",
                 "Let's run the test one more time to confirm."]}},
  ],
  lectura: [
    {id:"rd1",title:"Read: My Daily Routine",desc:"Texto corto + comprensión.",level:"Básico",
     content:{type:"reading",intro:"Lee el texto y responde las preguntas.",
      text:"My name is Ana. I am a technical student. I wake up at 6:30 every morning. I take the bus to college at 7:15. My classes start at 8:00. I study electronics. In the afternoon, I practice in the laboratory. I usually finish my homework at 9:00 pm. Then I watch videos in English to improve my listening.",
      questions:[
        {q:"What time does Ana wake up?",opts:["6:30","7:15","8:00"],a:0},
        {q:"What does Ana study?",opts:["Medicine","Electronics","Law"],a:1},
        {q:"Where does she practice in the afternoon?",opts:["In the library","At home","In the laboratory"],a:2},
        {q:"Why does she watch videos in English?",opts:["To improve listening","For fun","To sleep better"],a:0}]}},
    {id:"rd2",title:"Read: Safety First",desc:"Protocolo de seguridad técnica.",level:"Intermedio",
     content:{type:"reading",intro:"Lectura técnica: seguridad en laboratorio.",
      text:"Before entering the laboratory, all students must wear safety glasses and closed shoes. No food or drinks are allowed near the equipment. If you notice a damaged cable, report it to the technician immediately and do not touch it. Emergency exits are located on both sides of the room. Remember: safety procedures exist to protect both people and equipment.",
      questions:[
        {q:"What must students wear?",opts:["Hats","Safety glasses","Gloves only"],a:1},
        {q:"What should you do with a damaged cable?",opts:["Touch it carefully","Ignore it","Report it to the technician"],a:2},
        {q:"Where are the emergency exits?",opts:["On both sides","Only at the front","In the basement"],a:0},
        {q:"Why do safety procedures exist?",opts:["To protect people and equipment","To slow down work","For decoration"],a:0}]}},
    {id:"rd3",title:"Read: A Technical Abstract",desc:"Resumen de investigación.",level:"Avanzado",
     content:{type:"reading",intro:"Lectura académica: el estilo IMRaD.",
      text:"This study evaluates the performance of low-cost sensors in industrial environments. Twelve sensors were tested over a six-month period under varying temperature and humidity conditions. Results indicate that 83% of the devices maintained accuracy within acceptable thresholds. However, prolonged exposure to humidity above 80% significantly degraded performance. These findings suggest that low-cost sensors are viable for controlled environments but require additional protection in high-humidity applications.",
      questions:[
        {q:"How many sensors were tested?",opts:["6","12","80"],a:1},
        {q:"What degraded performance?",opts:["Low temperature","High humidity","Vibration"],a:1},
        {q:"What percentage maintained accuracy?",opts:["68%","80%","83%"],a:2},
        {q:"Where are low-cost sensors viable?",opts:["Controlled environments","Anywhere","Only outdoors"],a:0}]}},
  ]
};

/* =================== VOCES (masculinas) =================== */
let voices = [];
let tutorVoice = null;
const MALE_HINTS = ["daniel","david","mark","george","james","male","guy","alex","fred","google uk english male","microsoft david","richard","thomas","aaron","arthur","ryan"];

function loadVoices(){
  voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith("en"));
  tutorVoice = null;
  // 1) nombres claramente masculinos
  for(const hint of MALE_HINTS){
    tutorVoice = voices.find(v => v.name.toLowerCase().includes(hint));
    if(tutorVoice) break;
  }
  // 2) fallback: cualquier voz en inglés no marcada como female
  if(!tutorVoice) tutorVoice = voices.find(v => !/female|zira|susan|samantha|victoria|karen|moira|tessa|allison|ava|serena/i.test(v.name)) || voices[0] || null;
}
if("speechSynthesis" in window){
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

function speak(text, opts={}){
  return new Promise(resolve=>{
    if(!("speechSynthesis" in window)){ resolve(); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if(tutorVoice) u.voice = tutorVoice;
    u.lang = "en-US";
    u.rate = opts.rate ?? 0.95;
    u.pitch = opts.pitch ?? 0.85;   // tono ligeramente más grave → voz masculina clara
    u.volume = 1;
    u.onend = ()=>resolve();
    u.onerror = ()=>resolve();
    speechSynthesis.speak(u);
    showSpeaking(true);
    const check = setInterval(()=>{
      if(!speechSynthesis.speaking){ clearInterval(check); showSpeaking(false); resolve(); }
    },200);
  });
}
function showSpeaking(on){
  const waves = document.getElementById("speakingWaves");
  const avatar = document.getElementById("tutorAvatar");
  if(waves) waves.style.opacity = on ? "1" : ".25";
  if(avatar && on) avatar.classList.remove("hidden");
}

/* =================== HELPERS =================== */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const TYPE_NAMES = {escritura:"✍️ Escritura",audio:"🎧 Audio",habla:"🗣️ Conversación",vocabulario:"📚 Vocabulario",lectura:"📖 Lectura",gramatica:"⚙️ Gramática"};

function toast(msg){
  const t = $("#toast");
  t.textContent = msg; t.classList.remove("hidden");
  clearTimeout(t._h); t._h = setTimeout(()=>t.classList.add("hidden"),2600);
}
function addPoints(n,label){
  state.points += n;
  logActivity(`+${n} pts — ${label}`);
  saveState(); renderStats();
  toast(`⭐ +${n} puntos: ${label}`);
}
function logActivity(text){
  state.activity.unshift({text, time:new Date().toLocaleString("es-419")});
  state.activity = state.activity.slice(0,30);
}
function markDayDone(dayIdx){
  if(!state.completedDays[state.level]) state.completedDays[state.level] = [];
  if(!state.completedDays[state.level].includes(dayIdx)){
    state.completedDays[state.level].push(dayIdx);
    logActivity(`Día ${dayIdx+1} completado`);
  }
  saveState();
}

/* =================== NAVEGACIÓN =================== */
function showView(name){
  $$(".view").forEach(v=>v.classList.remove("active"));
  $("#view-"+name).classList.add("active");
  $$(".nav-btn").forEach(b=>b.classList.toggle("active", b.dataset.view===name));
  closeSidebar();
  if(name==="plan") renderPlan();
  if(name==="clases") renderLessons(currentFilter);
  if(name==="progreso") renderProgress();
  if(name==="dashboard") renderDashboard();
}

/* Sidebar móvil */
function openSidebar(){ $("#sidebar").classList.add("open"); $("#sidebarOverlay").classList.add("show"); }
function closeSidebar(){ $("#sidebar").classList.remove("open"); $("#sidebarOverlay").classList.remove("show"); }

/* =================== RENDER: DASHBOARD =================== */
function renderDashboard(){
  const hour = new Date().getHours();
  const greet = hour<12 ? "¡Buenos días! 🌅" : hour<19 ? "¡Buenas tardes! ☀️" : "¡Buenas noches! 🌙";
  $("#greeting").textContent = greet;
  const levelName = {basico:"Básico",intermedio:"Intermedio",avanzado:"Avanzado"}[state.level];
  const done = (state.completedDays[state.level]||[]).length;
  $("#heroSub").textContent = done===0
    ? `Nivel ${levelName}: tu plan de 30 días está listo. ¡Empecemos!`
    : `Nivel ${levelName}: llevas ${done} de 30 días. ¡Sigue así!`;
  renderStats();
  // continuar
  const next = CURRICULUM[state.level].findIndex((_,i)=>!(state.completedDays[state.level]||[]).includes(i));
  const cc = $("#continueCard");
  if(next===-1){
    cc.innerHTML = `<div class="info"><h3>🏆 ¡Plan completado!</h3><p>Terminaste los 30 días del nivel ${levelName}. Sube de nivel o repite clases.</p></div>
      <button class="btn primary" onclick="showView('clases')">Repasar clases</button>`;
  } else {
    const d = CURRICULUM[state.level][next];
    cc.innerHTML = `<div class="info"><h3>Día ${next+1}: ${d.topic}</h3><p>${TYPE_NAMES[d.t]} — ${d.desc}</p></div>
      <button class="btn primary" id="continueBtn">▶ Empezar ahora</button>`;
    $("#continueBtn").onclick = ()=>openDayModal(next);
  }
}
function renderStats(){
  const done = (state.completedDays[state.level]||[]).length;
  $("#statProgress").textContent = Math.round(done/30*100)+"%";
  $("#statDays").textContent = done+"/30";
  $("#statScore").textContent = state.points;
  $("#statTime").textContent = state.studyMinutes+" min";
  $("#streakDays").textContent = state.streak;
  $("#levelSelect").value = state.level;
}

/* =================== RENDER: PLAN =================== */
function renderPlan(){
  $("#planLevelName").textContent = {basico:"Básico",intermedio:"Intermedio",avanzado:"Avanzado"}[state.level];
  const grid = $("#planGrid");
  grid.innerHTML = "";
  const done = state.completedDays[state.level]||[];
  CURRICULUM[state.level].forEach((d,i)=>{
    const card = document.createElement("div");
    card.className = "day-card" + (done.includes(i)?" done":"");
    card.innerHTML = `${done.includes(i)?'<span class="check">✔</span>':""}
      <div class="day-num">Día ${i+1}</div>
      <div class="day-topic">${d.topic}</div>
      <div class="day-type">${TYPE_NAMES[d.t]}</div>`;
    card.onclick = ()=>openDayModal(i);
    grid.appendChild(card);
  });
}

/* =================== RENDER: CLASES =================== */
let currentFilter = "all";
function renderLessons(filter){
  currentFilter = filter;
  $$("#classFilters .tab").forEach(t=>t.classList.toggle("active", t.dataset.type===filter));
  const list = $("#lessonsList");
  list.innerHTML = "";
  let any = false;
  for(const type in LESSONS){
    if(filter!=="all" && type!==filter) continue;
    LESSONS[type].forEach(l=>{
      any = true;
      const card = document.createElement("div");
      card.className = "lesson-card";
      card.innerHTML = `<div class="lc-head"><span class="lc-type">${TYPE_NAMES[type]}</span><span class="lc-diff">${l.level}</span></div>
        <h3>${l.title}</h3><p>${l.desc}</p>
        <div class="lc-foot"><button class="btn primary sm">Iniciar clase</button></div>`;
      card.querySelector("button").onclick = ()=>openLesson(l);
      list.appendChild(card);
    });
  }
  if(!any) list.innerHTML = "<p>No hay clases en esta categoría.</p>";
}

/* =================== MODAL: DÍA DEL PLAN =================== */
function openDayModal(dayIdx){
  const d = CURRICULUM[state.level][dayIdx];
  const pool = LESSONS[d.t];
  const lesson = pool[dayIdx % pool.length];
  openLesson(lesson, {day:dayIdx, dayTopic:d.topic});
}

/* =================== MODAL: LECCIÓN =================== */
let sessionStart = 0;
function openLesson(lesson, extra={}){
  sessionStart = Date.now();
  const c = lesson.content;
  const box = $("#lessonContent");
  box.innerHTML = `<h2>${extra.dayTopic?`Día ${extra.day+1}: ${extra.dayTopic}`:lesson.title}</h2>
    <p class="lesson-meta">${TYPE_NAMES[Object.keys(LESSONS).find(k=>LESSONS[k].some(x=>x.id===lesson.id))||"vocabulario"]} · ${lesson.level}</p>
    <div class="lesson-body"></div>`;
  const body = box.querySelector(".lesson-body");
  body.innerHTML = `<p>${c.intro}</p>`;

  if(c.type==="vocab") renderVocab(body,c);
  if(c.type==="quiz") renderQuiz(body,c,lesson);
  if(c.type==="write") renderWrite(body,c,lesson);
  if(c.type==="dictation") renderDictation(body,c,lesson);
  if(c.type==="listening") renderListening(body,c,lesson);
  if(c.type==="speak") renderSpeak(body,c,lesson);
  if(c.type==="reading") renderReading(body,c,lesson);

  $("#lessonModal").classList.remove("hidden");
}

/* --- vocabulario --- */
function renderVocab(body,c){
  c.words.forEach(([en,es])=>{
    const row = document.createElement("div");
    row.className = "speak-row";
    row.innerHTML = `<button class="btn sm" title="Escuchar">🔊</button>
      <span class="sentence"><b>${en}</b> — ${es}</span>`;
    row.querySelector("button").onclick = ()=>speak(en,{rate:0.85});
    body.appendChild(row);
  });
  body.insertAdjacentHTML("beforeend",`<div class="tip-box">💡 Repite cada palabra en voz alta 2 veces. La repetición espaciada fija el vocabulario.</div>`);
  addLessonActions(body, 10, null);
}

/* --- quiz --- */
function renderQuiz(body,c,lesson){
  let idx=0, score=0;
  const area = document.createElement("div");
  body.appendChild(area);
  const scoreLine = document.createElement("div");
  scoreLine.className = "score-line"; body.appendChild(scoreLine);
  function showQ(){
    if(idx>=c.questions.length) return finishQuiz();
    const q = c.questions[idx];
    area.innerHTML = `<p style="margin-top:14px"><strong>${idx+1}. ${q.q}</strong></p>
      <div class="mc-options"></div><div class="feedback"></div>`;
    const opts = area.querySelector(".mc-options");
    q.opts.forEach((o,i)=>{
      const b = document.createElement("button");
      b.className = "mc-option"; b.textContent = o;
      b.onclick = ()=>{
        opts.querySelectorAll("button").forEach(x=>x.disabled=true);
        if(i===q.a){ b.classList.add("correct"); score++; }
        else { b.classList.add("wrong"); opts.children[q.a].classList.add("correct"); }
        const fb = area.querySelector(".feedback");
        fb.className = "feedback "+(i===q.a?"ok":"bad");
        fb.textContent = (i===q.a?"✅ ¡Correcto! ":"❌ Incorrecto. ")+q.why;
        speak(i===q.a?"Correct!":"Not quite. "+q.why,{rate:0.95});
        setTimeout(()=>{ idx++; showQ(); }, 2300);
      };
      opts.appendChild(b);
    });
    scoreLine.textContent = `Aciertos: ${score}/${idx}`;
  }
  function finishQuiz(){
    area.innerHTML = `<h3 style="margin-top:16px">🏁 Resultado: ${score}/${c.questions.length}</h3>
      <p style="margin-top:6px;color:var(--muted)">${score===c.questions.length?"¡Perfecto! Dominas este tema.":"Buen intento. Revisa las explicaciones y repite la clase."}</p>`;
    scoreLine.textContent = "";
    speak(score>=c.questions.length/2?`Great job! You got ${score} out of ${c.questions.length}.`:`You got ${score} out of ${c.questions.length}. Keep practicing!`);
    addLessonActions(body, score*4, score>=3);
  }
  showQ();
}

/* --- escritura --- */
function renderWrite(body,c,lesson){
  body.insertAdjacentHTML("beforeend",
    `<div class="tip-box">📝 Ejemplo del nivel esperado:<br><em>"${c.sample}"</em></div>
     <textarea class="write-input" rows="6" placeholder="Escribe aquí en inglés…"></textarea>
     <div class="feedback"></div>`);
  const actions = document.createElement("div");
  actions.className = "lesson-actions";
  actions.innerHTML = `<button class="btn primary">✅ Evaluar mi texto</button>
    <button class="btn">🔊 Escuchar ejemplo</button>`;
  body.appendChild(actions);
  const [evalBtn, hearBtn] = actions.querySelectorAll("button");
  const fb = body.querySelector(".feedback");
  hearBtn.onclick = ()=>speak(c.sample);
  evalBtn.onclick = ()=>{
    const text = body.querySelector("textarea").value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const lower = text.toLowerCase();
    const found = c.keywords.filter(k=>lower.includes(k));
    if(words < c.minWords){
      fb.className="feedback bad";
      fb.textContent = `✍️ Escribe al menos ${c.minWords} palabras (llevas ${words}). ¡Tú puedes!`;
      speak("Try to write a bit more. You can do it!");
      return;
    }
    let msg = `🎉 ¡Muy bien! Usaste ${words} palabras`;
    if(found.length) msg += ` e incluiste ${found.length}/${c.keywords.length} palabras clave (${found.join(", ")})`;
    msg += ". Sigue practicando para ganar fluidez.";
    fb.className="feedback ok"; fb.textContent = msg;
    speak("Well done! Your writing looks good. Keep practicing!");
    addLessonActions(body, 10+found.length*2, true);
  };
}

/* --- dictado --- */
function renderDictation(body,c,lesson){
  let idx=0, score=0, doneFlag=false;
  const area = document.createElement("div"); body.appendChild(area);
  const actions = document.createElement("div"); actions.className="lesson-actions"; body.appendChild(actions);
  function showSentence(){
    const s = c.sentences[idx];
    area.innerHTML = `<div class="listen-box">
        <p style="margin-bottom:10px"><strong>Frase ${idx+1} de ${c.sentences.length}</strong></p>
        <button class="btn primary" id="hearBtn">▶ Escuchar frase</button>
      </div>
      <input class="dictation-input" placeholder="Escribe exactamente lo que escuchas…" autocomplete="off">
      <div class="feedback"></div>`;
    area.querySelector("#hearBtn").onclick = async ()=>{
      await speak(s,{rate:0.8});
      setTimeout(()=>speak(s,{rate:0.8}), 600);
    };
    area.querySelector(".dictation-input").addEventListener("keydown",e=>{
      if(e.key==="Enter") check();
    });
    actions.innerHTML = `<button class="btn primary">✅ Comprobar</button>`;
    actions.querySelector("button").onclick = check;
    function check(){
      if(doneFlag) return;
      const val = area.querySelector(".dictation-input").value.trim().toLowerCase().replace(/[.,!?]$/,"");
      const target = s.toLowerCase().replace(/[.,!?]$/,"");
      const fb = area.querySelector(".feedback");
      if(val===target){
        fb.className="feedback ok"; fb.textContent = "✅ ¡Perfecto dictado!";
        speak("Perfect!"); score++;
      } else {
        fb.className="feedback bad"; fb.textContent = `❌ La frase era: "${s}"`;
        speak("The sentence was: "+s);
      }
      doneFlag = true;
      actions.innerHTML = `<button class="btn primary">${idx<c.sentences.length-1?"Siguiente frase ➜":"Ver resultado 🏁"}</button>`;
      actions.querySelector("button").onclick = ()=>{
        idx++; doneFlag=false;
        if(idx<c.sentences.length) showSentence(); else finish();
      };
    }
  }
  function finish(){
    area.innerHTML = `<h3 style="margin-top:16px">🏁 Dictado: ${score}/${c.sentences.length} correctas</h3>`;
    speak(`You got ${score} out of ${c.sentences.length} sentences.`);
    addLessonActions(body, score*4, score>=3);
  }
  showSentence();
}

/* --- listening --- */
function renderListening(body,c,lesson){
  let idx=0, score=0;
  const area = document.createElement("div"); body.appendChild(area);
  function showItem(){
    if(idx>=c.items.length) return finish();
    const [target, opts] = c.items[idx];
    // mezclar opciones
    const shuffled = [...opts].sort(()=>Math.random()-.5);
    area.innerHTML = `<div class="listen-box">
        <p style="margin-bottom:10px"><strong>Audio ${idx+1} de ${c.items.length}</strong></p>
        <button class="btn primary" id="playBtn">▶ Reproducir audio</button>
        <button class="btn" id="replayBtn">🔁 Repetir</button>
      </div>
      <div class="mc-options"></div><div class="feedback"></div>`;
    const play = ()=>speak(target,{rate:0.8});
    area.querySelector("#playBtn").onclick = play;
    area.querySelector("#replayBtn").onclick = play;
    setTimeout(play, 500);
    const optBox = area.querySelector(".mc-options");
    shuffled.forEach(o=>{
      const b = document.createElement("button");
      b.className="mc-option"; b.textContent = o;
      b.onclick = ()=>{
        optBox.querySelectorAll("button").forEach(x=>x.disabled=true);
        const ok = o===target;
        if(ok){ b.classList.add("correct"); score++; } else { b.classList.add("wrong");
          [...optBox.children].find(x=>x.textContent===target).classList.add("correct"); }
        const fb = area.querySelector(".feedback");
        fb.className = "feedback "+(ok?"ok":"bad");
        fb.textContent = ok ? "✅ ¡Exacto! Lo que escuchaste: "+target : "❌ Era: "+target;
        speak(ok?"Correct!":"It was: "+target);
        setTimeout(()=>{ idx++; showItem(); }, 2000);
      };
      optBox.appendChild(b);
    });
  }
  function finish(){
    area.innerHTML = `<h3 style="margin-top:16px">🏁 Comprensión auditiva: ${score}/${c.items.length}</h3>
      <p style="margin-top:6px;color:var(--muted)">${score>=c.items.length-1?"¡Excelente oído!":"Escucha podcasts cortos en inglés a diario para mejorar."}</p>`;
    speak(`You got ${score} out of ${c.items.length}.`);
    addLessonActions(body, score*5, score>=3);
  }
  showItem();
}

/* --- habla (pronunciación) --- */
function renderSpeak(body,c,lesson){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let idx=0;
  const area = document.createElement("div"); body.appendChild(area);
  if(!SR){
    area.innerHTML = `<div class="tip-box">⚠️ Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge. Aún así, puedes escuchar y repetir:</div>`;
  }
  function showSent(){
    const s = c.sentences[idx];
    area.innerHTML = `<p style="margin-top:12px"><strong>${idx+1}/${c.sentences.length}:</strong> "${s}"</p>
      <div class="lesson-actions" style="margin-top:12px">
        <button class="btn" id="modelBtn">🔊 Escuchar modelo</button>
        ${SR?'<button class="btn primary" id="recBtn">🎙️ Grabar mi voz</button>':""}
      </div>
      <div class="feedback"></div>`;
    area.querySelector("#modelBtn").onclick = ()=>speak(s,{rate:0.8});
    setTimeout(()=>speak(s,{rate:0.8}),400);
    if(SR){
      const recBtn = area.querySelector("#recBtn");
      recBtn.onclick = ()=>{
        const rec = new SR();
        rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 1;
        recBtn.textContent = "⏺️ Escuchando…"; recBtn.disabled = true;
        rec.onresult = e=>{
          const said = e.results[0][0].transcript.toLowerCase().replace(/[^a-z0-9\s]/g,"");
          const target = s.toLowerCase().replace(/[^a-z0-9\s]/g,"");
          const saidWords = said.split(/\s+/), targetWords = target.split(/\s+/);
          const hit = targetWords.filter(w=>saidWords.includes(w)).length;
          const pct = Math.round(hit/targetWords.length*100);
          state.pronScores.push(pct); saveState();
          const fb = area.querySelector(".feedback");
          if(pct>=80){ fb.className="feedback ok"; fb.textContent=`🌟 ¡Excelente pronunciación! (${pct}%) El tutor te entendió perfectamente.`; }
          else if(pct>=50){ fb.className="feedback ok"; fb.textContent=`👍 Buen intento: ${pct}%. Escucha el modelo y repite.`; }
          else { fb.className="feedback bad"; fb.textContent=`🔄 ${pct}% entendido. Escucha de nuevo y habla más lento y claro.`; }
          speak(pct>=80?"Excellent pronunciation!":pct>=50?"Good try. Listen and repeat.":"Let's try again. Listen carefully.",{rate:0.95});
          recBtn.textContent = "🎙️ Grabar de nuevo";
          recBtn.disabled = false;
          next(area);
        };
        rec.onerror = ()=>{ recBtn.textContent="🎙️ Grabar mi voz"; recBtn.disabled=false;
          area.querySelector(".feedback").className="feedback bad";
          area.querySelector(".feedback").textContent="⚠️ No se pudo acceder al micrófono. Verifica los permisos."; };
        rec.onend = ()=>{ if(recBtn.disabled){ recBtn.textContent="🎙️ Grabar mi voz"; recBtn.disabled=false; } };
        rec.start();
      };
    }
  }
  function next(area){
    const actions = document.createElement("div");
    actions.className = "lesson-actions";
    actions.innerHTML = `<button class="btn primary">${idx<c.sentences.length-1?"Siguiente ➜":"Terminar 🏁"}</button>`;
    actions.querySelector("button").onclick = ()=>{
      idx++;
      if(idx<c.sentences.length) showSent(); else finishSpeak(body,c);
    };
    area.appendChild(actions);
  }
  showSent();
}
function finishSpeak(body,c){
  const scores = state.pronScores.slice(-c.sentences.length);
  const avg = scores.length? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0;
  body.insertAdjacentHTML("beforeend",
    `<h3 style="margin-top:18px">🏁 Pronunciación promedio de la sesión: ${avg}%</h3>
     <p style="margin-top:6px;color:var(--muted)">Practica 10 minutos al día frente al espejo o con la clase en vivo.</p>`);
  addLessonActions(body, Math.round(avg/10)+5, avg>=60);
}

/* --- lectura --- */
function renderReading(body,c,lesson){
  body.insertAdjacentHTML("beforeend",`<div class="reading-text">${c.text}</div>
    <button class="btn sm" id="readAloud" style="margin-bottom:6px">🔊 Escuchar lectura</button>
    <div id="readQs"></div>`);
  $("#readAloud").onclick = ()=>speak(c.text,{rate:0.9});
  const qs = body.querySelector("#readQs");
  let idx=0, score=0, answered=false;
  function showQ(){
    if(idx>=c.questions.length) return finish();
    answered=false;
    const q = c.questions[idx];
    qs.innerHTML = `<p style="margin-top:14px"><strong>${idx+1}. ${q.q}</strong></p>
      <div class="mc-options"></div><div class="feedback"></div>`;
    const box = qs.querySelector(".mc-options");
    q.opts.forEach((o,i)=>{
      const b = document.createElement("button");
      b.className="mc-option"; b.textContent=o;
      b.onclick = ()=>{
        if(answered) return; answered=true;
        box.querySelectorAll("button").forEach(x=>x.disabled=true);
        if(i===q.a){ b.classList.add("correct"); score++; } else { b.classList.add("wrong"); box.children[q.a].classList.add("correct"); }
        const fb = qs.querySelector(".feedback");
        fb.className="feedback "+(i===q.a?"ok":"bad");
        fb.textContent = i===q.a?"✅ ¡Correcto! Revisa el texto si tienes dudas.":"❌ Relee el párrafo correspondiente.";
        speak(i===q.a?"Correct!":"Read the text again carefully.");
        setTimeout(()=>{ idx++; showQ(); }, 1800);
      };
      box.appendChild(b);
    });
  }
  function finish(){
    qs.innerHTML = `<h3 style="margin-top:16px">🏁 Comprensión de lectura: ${score}/${c.questions.length}</h3>`;
    speak(`Reading complete. You answered ${score} out of ${c.questions.length} correctly.`);
    addLessonActions(body, score*5, score>=3);
  }
  showQ();
}

/* --- acciones finales de lección --- */
function addLessonActions(body, pts, markDay){
  if(body.querySelector(".lesson-final")) return;
  const div = document.createElement("div");
  div.className = "lesson-actions lesson-final";
  div.innerHTML = `<button class="btn primary">✔ Completar clase${pts?` (+${pts} pts)`:""}</button>
    <button class="btn" id="closeLesson2">Cerrar</button>`;
  body.appendChild(div);
  div.querySelector(".btn.primary").onclick = ()=>{
    if(pts>0) addPoints(pts, "clase completada");
    const mins = Math.max(1, Math.round((Date.now()-sessionStart)/60000));
    state.studyMinutes += mins;
    logActivity(`⏱️ ${mins} min de estudio`);
    saveState(); renderStats();
    $("#lessonModal").classList.add("hidden");
    toast("✅ ¡Clase completada! Sigue así.");
    if(markDay===true){ /* marca día sugerido */ }
  };
  div.querySelector("#closeLesson2").onclick = ()=>$("#lessonModal").classList.add("hidden");
}

/* =================== CLASE EN VIVO =================== */
let camStream = null, micStream = null, micAnalyser = null, micRAF = null;

async function toggleCamera(){
  const btn = $("#camBtn"), video = $("#liveVideo"), ph = $("#videoPlaceholder");
  if(camStream){
    camStream.getTracks().forEach(t=>t.stop()); camStream = null;
    video.srcObject = null; ph.style.display = "flex";
    btn.textContent = "📷 Activar cámara";
    return;
  }
  try{
    camStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"}});
    video.srcObject = camStream; ph.style.display = "none";
    btn.textContent = "📷 Apagar cámara";
    tutorGreet();
  }catch(e){
    toast("⚠️ No se pudo acceder a la cámara. Revisa los permisos del navegador.");
  }
}
async function toggleMic(){
  const btn = $("#micBtn");
  if(micStream){
    cancelAnimationFrame(micRAF);
    micStream.getTracks().forEach(t=>t.stop()); micStream = null;
    btn.textContent = "🎙️ Activar micrófono";
    $("#micLevel").textContent = "—";
    return;
  }
  try{
    micStream = await navigator.mediaDevices.getUserMedia({audio:true});
    btn.textContent = "🎙️ Apagar micrófono";
    // medidor de nivel
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const src = ctx.createMediaStreamSource(micStream);
    micAnalyser = ctx.createAnalyser(); micAnalyser.fftSize = 256;
    src.connect(micAnalyser);
    const data = new Uint8Array(micAnalyser.frequencyBinCount);
    (function loop(){
      micAnalyser.getByteFrequencyData(data);
      const avg = data.reduce((a,b)=>a+b,0)/data.length;
      $("#micLevel").textContent = avg>60?"¡Perfecto! 🟢":avg>25?"Bien 🟡":"Bajo 🔴";
      micRAF = requestAnimationFrame(loop);
    })();
  }catch(e){
    toast("⚠️ No se pudo acceder al micrófono. Revisa los permisos.");
  }
}

/* Chat con el tutor */
const TUTOR_REPLIES = [
  {match:/\b(hello|hi|hey|good (morning|afternoon|evening))\b/i,
   say:"Hello! Welcome to your live English class. How are you today?",
   tip:"Responde: 'I'm fine, thank you. And you?'"},
  {match:/how are you/i,
   say:"I'm doing great, thank you for asking! Are you ready to practice some English?",
   tip:"Practica: 'I'm ready to practice my pronunciation.'"},
  {match:/repeat|slowly|again/i,
   say:"Of course. I will speak more slowly. Please listen carefully and repeat after me.",
   tip:"Pide al tutor que dicte una frase con el botón 🗣️"},
  {match:/name|who are you/i,
   say:"I am your AI English tutor. I help technical students become fluent in thirty days.",
   tip:"Pregunta: 'What can I practice with you?'"},
  {match:/(start|begin|class|ready)/i,
   say:"Excellent! Let's begin. Today's topic is technical vocabulary. Repeat after me: The system is working correctly.",
   tip:"Repite en voz alta: 'The system is working correctly.'"},
  {match:/thank/i,
   say:"You're very welcome! Remember: practice makes perfect. See you tomorrow!",
   tip:"Despídete: 'See you tomorrow, teacher!'"},
  {match:/(bye|see you|goodbye)/i,
   say:"Goodbye! Great class today. Don't forget to complete your daily lesson.",
   tip:"Vuelve mañana para mantener tu racha 🔥"},
  {match:/\?$/,
   say:"That is an excellent question. In technical English, clarity is more important than speed. Try to give a complete answer using: subject, verb, and complement.",
   tip:"Estructura: 'I think that… because…'"},
];
const DEFAULT_REPLIES = [
  "Very good! Try to expand your answer with one more sentence.",
  "Nice! Remember to pronounce the final consonants clearly.",
  "Good effort! A more technical way to say that would be: 'According to the data, …'",
  "I understand. Can you tell me more details about that?",
  "Excellent practice! Let's continue: describe your last project in two sentences.",
];
let defaultIdx = 0;

function addMsg(text, who, tip){
  const box = $("#chatBox");
  const div = document.createElement("div");
  div.className = "msg "+who;
  div.innerHTML = text + (tip?`<span class="mini">💡 ${tip}</span>`:"");
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
async function tutorRespond(userText){
  const rule = TUTOR_REPLIES.find(r=>r.match.test(userText));
  let say, tip;
  if(rule){ say = rule.say; tip = rule.tip; }
  else { say = DEFAULT_REPLIES[defaultIdx++ % DEFAULT_REPLIES.length]; tip = "Escribe otra frase para seguir practicando."; }
  await new Promise(r=>setTimeout(r, 500));
  addMsg(say,"tutor",tip);
  speak(say,{rate:0.92});
}
function sendChat(text){
  const t = (text||$("#chatInput").value).trim();
  if(!t) return;
  addMsg(t,"user");
  $("#chatInput").value = "";
  tutorRespond(t);
  state.studyMinutes += 0; // chat ligero
  logActivity("🎥 Práctica en clase en vivo");
  saveState();
}
let greeted = false;
function tutorGreet(){
  if(greeted) return; greeted = true;
  setTimeout(async ()=>{
    const g = "Welcome to your live class! I can see you now. Turn on your microphone and let's practice. How are you today?";
    addMsg(g,"tutor","Activa el micrófono 🎙️ y habla, o escribe aquí abajo.");
    speak(g,{rate:0.92});
  },800);
}
$("#speakBtn")?.addEventListener("click", async ()=>{
  const phrases = [
    "Repeat after me: The machine is working perfectly.",
    "Listen and repeat: We tested the system three times.",
    "Say this with me: Safety always comes first.",
    "Repeat: The results were better than expected.",
    "One more time: Practice makes perfect."
  ];
  const p = phrases[Math.floor(Math.random()*phrases.length)];
  $("#tutorAvatar").classList.remove("hidden");
  addMsg("🗣️ "+p,"tutor","Repite la frase en voz alta con tu micrófono activado.");
  await speak(p,{rate:0.82});
});

/* =================== PROGRESO =================== */
function renderProgress(){
  const done = (state.completedDays[state.level]||[]).length;
  const pct = Math.round(done/30*100);
  $("#ringPct").textContent = pct+"%";
  const C = 2*Math.PI*52;
  $("#ringFg").style.strokeDashoffset = C*(1-pct/100);
  $("#pts2").textContent = state.points;
  $("#daysDone").textContent = done;
  const ps = state.pronScores;
  $("#pronScore").textContent = ps.length? Math.round(ps.reduce((a,b)=>a+b,0)/ps.length)+"% promedio" : "—";
  const badges = [
    [0,"Novato","Comienza tu viaje"],[100,"Aprendiz","100 puntos de experiencia"],
    [300,"Estudiante Activo","300 puntos acumulados"],[600,"Técnico Bilingüe","600 puntos"],
    [1000,"Experto Técnico","1000 puntos. ¡Impresionante!"]
  ];
  let b = badges[0];
  for(const bd of badges) if(state.points>=bd[0]) b = bd;
  $("#badgeName").textContent = b[1]; $("#badgeDesc").textContent = b[2];
  const log = $("#activityLog");
  log.innerHTML = state.activity.length
    ? state.activity.map(a=>`<li><strong>${a.time}</strong> — ${a.text}</li>`).join("")
    : "<li>Sin actividad todavía. Completa tu primera clase.</li>";
}

/* =================== RACHA (streak) =================== */
function updateStreak(){
  const today = new Date().toDateString();
  const last = state.lastVisit;
  if(last !== today){
    const yesterday = new Date(Date.now()-86400000).toDateString();
    state.streak = (last === yesterday) ? (state.streak||0)+1 : 1;
    state.lastVisit = today;
    saveState();
  }
}

/* =================== EVENTOS =================== */
function initEvents(){
  // splash
  $$(".level-btn").forEach(b=>b.addEventListener("click",()=>{
    state.level = b.dataset.level; saveState();
    $("#splash").classList.add("hidden");
    $("#app").classList.remove("hidden");
    updateStreak(); renderDashboard();
    setTimeout(()=>speak(`Welcome! Your 30 day English plan is ready. Let's start day one. You can do this!`,{rate:0.92}), 400);
  }));
  if(state.level){ $("#splash").classList.add("hidden"); $("#app").classList.remove("hidden"); }

  // nav
  $$(".nav-btn").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
  $("#menuBtn").addEventListener("click",openSidebar);
  $("#sidebarOverlay").addEventListener("click",closeSidebar);
  $$(".type-card").forEach(c=>c.addEventListener("click",()=>{
    showView(c.dataset.goto); renderLessons(c.dataset.type);
    $$("#classFilters .tab").forEach(t=>t.classList.toggle("active", t.dataset.type===c.dataset.type));
  }));
  $$("#classFilters .tab").forEach(t=>t.addEventListener("click",()=>renderLessons(t.dataset.type)));

  // nivel
  $("#levelSelect").addEventListener("change",e=>{
    state.level = e.target.value; saveState();
    renderDashboard(); toast("Nivel cambiado a "+{basico:"Básico",intermedio:"Intermedio",avanzado:"Avanzado"}[state.level]);
  });

  // voz
  const testVoice = ()=>speak("Hello! I am your English tutor. I will help you learn technical English in thirty days. Let's begin!",{rate:0.92});
  $("#voiceTestBtn").addEventListener("click",testVoice);
  $("#voiceTestBtn2").addEventListener("click",testVoice);

  // modal
  $("#modalClose").addEventListener("click",()=>$("#lessonModal").classList.add("hidden"));
  $("#lessonModal").addEventListener("click",e=>{ if(e.target.id==="lessonModal") $("#lessonModal").classList.add("hidden"); });

  // live
  $("#camBtn").addEventListener("click",toggleCamera);
  $("#micBtn").addEventListener("click",toggleMic);
  $("#chatSend").addEventListener("click",()=>sendChat());
  $("#chatInput").addEventListener("keydown",e=>{ if(e.key==="Enter") sendChat(); });
  $$(".chip").forEach(c=>c.addEventListener("click",()=>sendChat(c.dataset.phrase)));

  // reset
  $("#resetBtn").addEventListener("click",()=>{
    if(confirm("¿Seguro que quieres reiniciar todo tu progreso?")){
      localStorage.removeItem(STORE_KEY); location.reload();
    }
  });

  // atajo de teclado: Esc cierra modal
  document.addEventListener("keydown",e=>{ if(e.key==="Escape") $("#lessonModal").classList.add("hidden"); });
}

/* =================== ARRANQUE =================== */
document.addEventListener("DOMContentLoaded",()=>{
  initEvents();
  if(state.level){ updateStreak(); renderDashboard(); }
});
