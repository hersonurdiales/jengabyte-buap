import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, RoundedBox } from '@react-three/drei';
import { Physics, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, CircleHelp, RotateCcw, X } from 'lucide-react';

type Category = { name: string; color: string; mark: string };
const categories: Category[] = [
  { name: 'Programación', color: '#e7773e', mark: '01' },
  { name: 'Bases de datos', color: '#3d8580', mark: '02' },
  { name: 'Redes', color: '#6387ae', mark: '03' },
  { name: 'Sistemas operativos', color: '#8766a6', mark: '04' },
  { name: 'Desarrollo web', color: '#d7798a', mark: '05' },
  { name: 'Ing. de software', color: '#a1844b', mark: '06' },
  { name: 'Seguridad', color: '#b85548', mark: '07' },
  { name: 'General TI', color: '#73806a', mark: '08' },
];
const playerAvatars = ['🐺', '🦊', '🐼', '🦉', '🐸'];
const playerColors = ['#bc6446', '#3d8580', '#6387ae', '#8766a6', '#a1844b'];
type Question = { q: string; options: string[]; answer: number; explain: string };
type Difficulty = 'facil' | 'intermedia' | 'dificil';
const questions: Question[] = [
  { q: '¿Qué estructura de datos sigue el principio LIFO?', options: ['Cola', 'Pila', 'Árbol', 'Grafo'], answer: 1, explain: 'Una pila entrega primero el último elemento que recibió: Last In, First Out.' },
  { q: '¿Qué instrucción recupera filas de una tabla SQL?', options: ['SELECT', 'INSERT', 'UPDATE', 'CREATE'], answer: 0, explain: 'SELECT consulta y devuelve datos almacenados en una o más tablas.' },
  { q: '¿Qué servicio traduce un dominio a una dirección IP?', options: ['DHCP', 'DNS', 'FTP', 'SSH'], answer: 1, explain: 'DNS relaciona nombres de dominio legibles con direcciones IP.' },
  { q: '¿Qué administra principalmente un sistema operativo?', options: ['Los recursos del equipo', 'El contenido de una web', 'Las consultas SQL', 'Los cables de red'], answer: 0, explain: 'El sistema operativo coordina el hardware y ofrece servicios a las aplicaciones.' },
  { q: 'En HTML, ¿qué elemento representa el encabezado principal?', options: ['<head>', '<h1>', '<title>', '<header1>'], answer: 1, explain: 'La etiqueta <h1> identifica el encabezado de mayor nivel del contenido.' },
  { q: '¿Qué documento reúne requisitos funcionales y no funcionales?', options: ['Especificación de requisitos', 'Plan de pruebas', 'Diagrama de red', 'Manual de usuario'], answer: 0, explain: 'La especificación de requisitos registra qué debe hacer el sistema y sus restricciones.' },
  { q: '¿Qué práctica ayuda a proteger una contraseña almacenada?', options: ['Guardarla en texto plano', 'Usar un hash con salt', 'Codificarla en Base64', 'Cambiar mayúsculas por números'], answer: 1, explain: 'Un hash lento con salt dificulta recuperar contraseñas incluso si se filtra la base.' },
  { q: '¿Qué modelo permite acceder a servidores por internet bajo demanda?', options: ['Computación en la nube', 'Sistema de archivos local', 'Compilación cruzada', 'Red de área personal'], answer: 0, explain: 'La nube ofrece recursos de cómputo a través de internet cuando se necesitan.' },
];
const easyQuestions: Question[] = [
  { q: '¿Qué instrucción muestra un mensaje en la consola de JavaScript?', options: ['print.console()', 'console.log()', 'echo()', 'console.write()'], answer: 1, explain: 'console.log() imprime información en la consola del navegador o del entorno de ejecución.' },
  { q: '¿Qué comando SQL agrega un registro a una tabla?', options: ['SELECT', 'DROP', 'INSERT', 'DELETE'], answer: 2, explain: 'INSERT añade nuevas filas a una tabla.' },
  { q: '¿Qué dispositivo conecta varios equipos de casa a internet?', options: ['Monitor', 'Router', 'Teclado', 'Impresora'], answer: 1, explain: 'El router dirige el tráfico entre los dispositivos de la red local y otras redes.' },
  { q: '¿Qué programa administra la memoria y los dispositivos de una computadora?', options: ['Navegador', 'Editor de texto', 'Hoja de cálculo', 'Sistema operativo'], answer: 3, explain: 'El sistema operativo administra los recursos del equipo y permite ejecutar aplicaciones.' },
  { q: '¿Para qué se usa principalmente HTML?', options: ['Definir la estructura de una página', 'Editar fotografías', 'Administrar usuarios', 'Crear una red local'], answer: 0, explain: 'HTML organiza el contenido de una página con elementos como títulos, párrafos y enlaces.' },
  { q: '¿Para qué sirve una prueba de software?', options: ['Aumentar la memoria física', 'Cambiar el color del monitor', 'Comprobar que el programa funciona', 'Crear una dirección IP'], answer: 2, explain: 'Las pruebas comparan el comportamiento del software con lo que se espera que haga.' },
  { q: '¿Cuál contraseña es más segura?', options: ['12345678', 'El nombre propio', 'La palabra password', 'Una frase larga y única'], answer: 3, explain: 'Una contraseña larga y distinta para cada servicio es más difícil de adivinar.' },
  { q: '¿Qué significa hardware?', options: ['Los programas instalados', 'Las partes físicas del equipo', 'Una página de internet', 'Una contraseña cifrada'], answer: 1, explain: 'Hardware son los componentes físicos, como la memoria, el procesador y el teclado.' },
];
const hardQuestions: Question[] = [
  { q: '¿Qué complejidad tiene la búsqueda binaria en una lista ordenada?', options: ['O(n)', 'O(2ⁿ)', 'O(log n)', 'O(n²)'], answer: 2, explain: 'Cada paso descarta aproximadamente la mitad de los elementos, por eso requiere O(log n) pasos.' },
  { q: '¿Qué forma normal elimina dependencias transitivas entre atributos?', options: ['Tercera forma normal', 'Primera forma normal', 'Segunda forma normal', 'Forma normal de Boyce-Codd'], answer: 0, explain: 'La tercera forma normal elimina dependencias transitivas de atributos que no son clave.' },
  { q: '¿Qué ofrece TCP a una aplicación?', options: ['Asignación de nombres de dominio', 'Cifrado obligatorio del contenido', 'Traducción de direcciones IP', 'Entrega confiable y ordenada de datos'], answer: 3, explain: 'TCP detecta pérdidas, retransmite datos y entrega los segmentos en orden.' },
  { q: '¿Qué comparten normalmente los hilos de un mismo proceso?', options: ['Una pila de ejecución única', 'El espacio de memoria del proceso', 'Un identificador de proceso distinto', 'Un sistema operativo distinto'], answer: 1, explain: 'Los hilos comparten recursos y memoria del proceso, aunque cada uno mantiene su propia pila.' },
  { q: '¿Qué indica una respuesta HTTP 403?', options: ['El cliente no se ha autenticado', 'El recurso fue creado', 'El servidor entendió la petición, pero niega el acceso', 'El servidor no encontró la ruta'], answer: 2, explain: '403 Forbidden indica que el servidor entendió la solicitud, pero no autoriza el acceso.' },
  { q: 'En Scrum, ¿quién prioriza el Product Backlog?', options: ['Scrum Master', 'Product Owner', 'Equipo de desarrollo', 'Cliente de pruebas'], answer: 1, explain: 'El Product Owner ordena el Product Backlog para maximizar el valor del producto.' },
  { q: '¿Para qué se agrega un salt al almacenar contraseñas?', options: ['Para poder recuperar la contraseña original', 'Para reemplazar el algoritmo de hash', 'Para reducir la longitud de la contraseña', 'Para que cada hash use un valor aleatorio único'], answer: 3, explain: 'Un salt único evita que contraseñas iguales generen hashes idénticos y dificulta ataques con tablas precalculadas.' },
  { q: '¿Qué permite la virtualización de servidores?', options: ['Ejecutar varias máquinas virtuales en un mismo equipo físico', 'Eliminar la necesidad de un sistema operativo', 'Convertir una aplicación web en HTML', 'Aumentar la velocidad de una conexión DNS'], answer: 0, explain: 'Un hipervisor reparte los recursos físicos entre varias máquinas virtuales aisladas.' },
];
const questionSets: Record<Difficulty, Question[]> = { facil: easyQuestions, intermedia: questions, dificil: hardQuestions };
const difficultyOptions: { id: Difficulty; label: string; hint: string }[] = [
  { id: 'facil', label: 'Fácil', hint: 'Conceptos básicos' },
  { id: 'intermedia', label: 'Intermedia', hint: 'Conocimientos clave' },
  { id: 'dificil', label: 'Difícil', hint: 'Retos de análisis' },
];
type BlockData = { id: number; level: number; slot: number; cat: number };
const initialBlocks: BlockData[] = Array.from({ length: 18 * 3 }, (_, id) => ({ id, level: Math.floor(id / 3), slot: id % 3, cat: (id * 5 + Math.floor(id / 3) * 3) % categories.length }));

function Wolf({ mood, advice, correct }: { mood: 'hey' | 'good' | 'oops' | 'win'; advice?: string; correct?: boolean }) {
  const lines = { hey: '¡Tu turno! Elige un bloque con calma.', good: '¡Bien jugado! Ahora corona la torre.', oops: '¡Ups! Una más y seguimos con el grupo.', win: '¡La torre cayó! ¿Otra ronda?' };
  return <div className={`wolf-guide ${advice ? 'with-advice' : ''} ${correct ? 'advice-correct' : ''}`}><img className={`wolf-portrait ${mood}`} src="/images/lobit.webp" alt="Lobit, el lobo guía"/><div className="wolf-copy"><small>{advice ? (correct ? '¡BUEN OJO! · CONSEJO DEL LOBO' : 'CONSEJO DEL LOBO') : 'LOBIT · TU GUÍA'}</small><p>{advice ?? lines[mood]}</p></div></div>;
}

function TowerPhysics({ blocks, removed, extractingId, physicsActive, falling, onPick, onTipping, onCollapse }: {
  blocks: BlockData[]; removed: number[]; extractingId: number | null; physicsActive: boolean; falling: boolean;
  onPick: (b: BlockData, body: RapierRigidBody) => void; onTipping: () => void; onCollapse: () => void;
}) {
  const bodies = useRef(new Map<number, RapierRigidBody>());
  const warned = useRef(false);
  const collapsed = useRef(false);
  const previousExtracting = useRef<number | null>(null);
  const safeUntil = useRef(0);
  useFrame(() => {
    if (previousExtracting.current !== extractingId) { previousExtracting.current = extractingId; warned.current = false; safeUntil.current = performance.now() + 1350; }
    if (!physicsActive || falling || collapsed.current || performance.now() < safeUntil.current) return;
    for (const block of blocks) {
      if (removed.includes(block.id) || block.id === extractingId) continue;
      const body = bodies.current.get(block.id); if (!body) continue;
      const p = body.translation(); const horizontal = block.level % 2 === 0;
      const x = horizontal ? 0 : (block.slot - 1) * .92;
      const z = horizontal ? (block.slot - 1) * .92 : 0;
      const y = .16 + block.level * .32;
      const drift = Math.hypot(p.x - x, p.z - z); const drop = y - p.y;
      const rotation = body.rotation(); const tilt = 2 * Math.acos(Math.min(1, Math.abs(rotation.w)));
      if (!warned.current && (drift > .2 || drop > .15 || tilt > .2)) { warned.current = true; onTipping(); }
      if (drift > 1.2 || drop > .82 || tilt > 1.05) { collapsed.current = true; onCollapse(); return; }
    }
  });
  return <Physics gravity={[0, -9.81, 0]} colliders={false}>
    <RigidBody type="fixed" colliders="cuboid" friction={1} restitution={0}><mesh position={[0, -.12, 0]} receiveShadow><boxGeometry args={[7, .24, 6]} /><meshStandardMaterial color="#d9dfe6" roughness={.9} /></mesh></RigidBody>
    {blocks.filter(b => !removed.includes(b.id)).map(b => {
      const horizontal = b.level % 2 === 0;
      const x = horizontal ? 0 : (b.slot - 1) * .92;
      const z = horizontal ? (b.slot - 1) * .92 : 0;
      const y = .16 + b.level * .32;
      const eligible = b.level < 16;
      const cat = categories[b.cat];
      const size: [number, number, number] = horizontal ? [2.8, .32, .92] : [.92, .32, 2.8];
      return <RigidBody key={b.id} ref={body => { if (body) bodies.current.set(b.id, body); else bodies.current.delete(b.id); }} type={physicsActive || falling || b.id === extractingId ? 'dynamic' : 'fixed'} gravityScale={b.id === extractingId ? 0 : 1} colliders="cuboid" position={[x, y, z]} restitution={0} friction={.95} linearDamping={.08} angularDamping={.65}>
        <RoundedBox args={size} radius={.018} smoothness={1} castShadow receiveShadow onClick={eligible && !falling && extractingId === null ? (e) => { e.stopPropagation(); const body = bodies.current.get(b.id); if (body) onPick(b, body); } : undefined}>
          <meshStandardMaterial color={cat.color} roughness={.92} metalness={0} />
        </RoundedBox>
      </RigidBody>;
    })}
  </Physics>;
}

function Tower({ blocks, removed, extractingId, physicsActive, falling, onPick, onTipping, onCollapse }: {
  blocks: BlockData[]; removed: number[]; extractingId: number | null; physicsActive: boolean; falling: boolean;
  onPick: (b: BlockData, body: RapierRigidBody) => void; onTipping: () => void; onCollapse: () => void;
}) {
  return <Canvas camera={{ position: [6.5, 5.2, 7.5], fov: 38 }} shadows dpr={[1, 1.5]}>
    <color attach="background" args={['#e9eef4']} />
    <ambientLight intensity={1.05} /><directionalLight position={[4, 9, 6]} intensity={1.8} castShadow shadow-mapSize={1024} />
    <Suspense fallback={null}><Environment preset="apartment" /></Suspense>
    <TowerPhysics blocks={blocks} removed={removed} extractingId={extractingId} physicsActive={physicsActive} falling={falling} onPick={onPick} onTipping={onTipping} onCollapse={onCollapse}/>
    <ContactShadows position={[0, -.005, 0]} opacity={.26} blur={2} far={8} />
    <OrbitControls enablePan={false} minDistance={7} maxDistance={14} minPolarAngle={.5} maxPolarAngle={1.48} target={[0, 3.1, 0]} />
  </Canvas>;
}

function WelcomeTower() {
  const reduceMotion = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  return <Canvas camera={{ position: [6.5, 5.2, 7.5], fov: 38 }} shadows dpr={[1, 1.5]}>
    <color attach="background" args={['#e8eef6']} />
    <ambientLight intensity={1.05} />
    <directionalLight position={[4, 9, 6]} intensity={1.8} castShadow shadow-mapSize={1024} />
    <Suspense fallback={null}><Environment preset="apartment" /></Suspense>
    <group position={[0, -.08, 0]}>
      {initialBlocks.map(block => {
        const horizontal = block.level % 2 === 0;
        const x = horizontal ? 0 : (block.slot - 1) * .92;
        const z = horizontal ? (block.slot - 1) * .92 : 0;
        return <RoundedBox key={block.id} args={horizontal ? [2.8, .32, .92] : [.92, .32, 2.8]} radius={.018} smoothness={1} position={[x, .16 + block.level * .32, z]} castShadow receiveShadow>
          <meshStandardMaterial color={categories[block.cat].color} roughness={.92} metalness={0} />
        </RoundedBox>;
      })}
      <mesh position={[0, -.12, 0]} receiveShadow><boxGeometry args={[7, .24, 6]} /><meshStandardMaterial color="#d9dfe6" roughness={.9} /></mesh>
    </group>
    <ContactShadows position={[0, -.005, 0]} opacity={.26} blur={2} far={8} />
    <OrbitControls autoRotate={!reduceMotion} autoRotateSpeed={.75} enablePan={false} minDistance={7} maxDistance={14} minPolarAngle={.5} maxPolarAngle={1.48} target={[0, 3.1, 0]} />
  </Canvas>;
}

export default function App() {
  const [names, setNames] = useState(['Ana', 'Luis', 'Majo', '']);
  const [avatarChoices, setAvatarChoices] = useState([0, 1, 2, 3]);
  const [colorChoices, setColorChoices] = useState([0, 1, 2, 3]);
  const [playerCount, setPlayerCount] = useState(3);
  const [difficulty, setDifficulty] = useState<Difficulty>('intermedia');
  const [started, setStarted] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [removed, setRemoved] = useState<number[]>([]);
  const [pulledThisTurn, setPulledThisTurn] = useState<BlockData[]>([]);
  const [turn, setTurn] = useState(0);
  const [extractingId, setExtractingId] = useState<number | null>(null);
  const [towerState, setTowerState] = useState<'steady' | 'fallen'>('steady');
  const [physicsActive, setPhysicsActive] = useState(false);
  const [showFallOverlay, setShowFallOverlay] = useState(false);
  const [gameVersion, setGameVersion] = useState(0);
  const pickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [falling, setFalling] = useState(false);
  const [phase, setPhase] = useState<'pick' | 'extracting' | 'question' | 'feedback' | 'over'>('pick');
  const [picked, setPicked] = useState<BlockData | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [wrongPull, setWrongPull] = useState(false);
  const [mood, setMood] = useState<'hey' | 'good' | 'oops' | 'win'>('hey');
  const [lastMessage, setLastMessage] = useState('Un salón, una torre y un reto por turno.');
  const currentName = names[turn % playerCount] || `Jugador ${turn + 1}`;
  const score = useMemo(() => Array.from({ length: playerCount }, (_, i) => ({ name: names[i] || `Jugador ${i + 1}`, color: playerColors[colorChoices[i]], avatar: playerAvatars[avatarChoices[i]], active: i === turn % playerCount })), [names, avatarChoices, colorChoices, playerCount, turn]);

  useEffect(() => {
    if (!showHowToPlay) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setShowHowToPlay(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showHowToPlay]);

  useEffect(() => {
    if (!showExitConfirm) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setShowExitConfirm(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showExitConfirm]);

  function startGame() { setStarted(true); setPhase('pick'); setTowerState('steady'); setLastMessage(`${currentName}, retira una pieza y observa cómo se redistribuye el peso.`); }
  function pickBlock(block: BlockData, body: RapierRigidBody) {
    if (phase !== 'pick' || extractingId !== null) return;
    const horizontal = block.level % 2 === 0;
    const sign = block.slot === 1 ? 1 : -1;
    setPhysicsActive(true); setExtractingId(block.id); setPhase('extracting'); setLastMessage('Sacando la pieza; la torre reparte el peso entre los bloques restantes.');
    requestAnimationFrame(() => {
      body.setGravityScale(0, true);
      body.setLinvel(horizontal ? { x: 2.15 * sign, y: 0, z: 0 } : { x: 0, y: 0, z: 2.15 * sign }, true);
    });
    pickTimer.current = setTimeout(() => {
      setRemoved(current => [...current, block.id]); setPicked(block); setPulledThisTurn(current => [...current, block]);
      setQuestion(questionSets[difficulty][block.cat % questionSets[difficulty].length]); setChosen(null); setExtractingId(null); setPhase('question');
    }, 1250);
  }
  function onTipping() { setTowerState('moving'); setLastMessage('La torre se está desplazando.'); }
  function beginCollapse() {
    if (pickTimer.current) clearTimeout(pickTimer.current);
    setExtractingId(null); setFalling(true); setTowerState('fallen'); setPhase('over'); setMood('win'); setLastMessage(`${currentName} hizo caer la torre.`);
    collapseTimer.current = setTimeout(() => setShowFallOverlay(true), 1400);
  }
  function answer(index: number) {
    if (chosen !== null || !question) return;
    setChosen(index);
    if (index === question.answer) { setPhase('feedback'); setMood('good'); setLastMessage('¡Correcto! Coloca el bloque arriba.'); }
    else { setPhase('feedback'); setMood('oops'); setLastMessage('Respuesta incorrecta. Retira una pieza más.'); }
  }
  function advance() {
    if (phase === 'over') return;
    if (chosen !== null && question && chosen !== question.answer && !wrongPull) {
      setWrongPull(true); setPhase('pick'); setPicked(null); setQuestion(null); setChosen(null); setLastMessage(`${currentName}, retira un bloque más y luego cede el turno.`); setMood('oops'); return;
    }
    const placedCount = blocks.length - initialBlocks.length;
    const newTopBlocks = pulledThisTurn.map((block, index) => ({ ...block, id: initialBlocks.length + placedCount + index, level: 18 + Math.floor((placedCount + index) / 3), slot: (placedCount + index) % 3 }));
    setBlocks(current => [...current, ...newTopBlocks]); setPulledThisTurn([]);
    setTurn(t => (t + 1) % playerCount); setPhase('pick'); setPicked(null); setQuestion(null); setChosen(null); setWrongPull(false); setMood('hey'); setLastMessage('Tu turno. Elige un bloque con calma.');
  }
  function reset() { if (pickTimer.current) clearTimeout(pickTimer.current); if (collapseTimer.current) clearTimeout(collapseTimer.current); setGameVersion(v => v + 1); setBlocks(initialBlocks); setRemoved([]); setPulledThisTurn([]); setTurn(0); setExtractingId(null); setTowerState('steady'); setPhysicsActive(false); setShowFallOverlay(false); setFalling(false); setPhase('pick'); setPicked(null); setQuestion(null); setChosen(null); setWrongPull(false); setMood('hey'); setLastMessage('Un salón, una torre y un reto por turno.'); }
  function returnToMenu() { reset(); setStarted(false); setShowExitConfirm(false); }
  const options = question?.options ?? [];
  const turnStability = Math.max(10, 100 - removed.length * 3);
  const stabilityValue = towerState === 'fallen' ? 0 : towerState === 'moving' ? Math.max(12, turnStability - 18) : turnStability;

  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="#" aria-label="Jenga BUAP inicio"><span className="brand-mark">J</span><span>JENGABYTE <b>BUAP</b></span></a><div className="top-context"><span className="live-dot" /> RETO DE AULA <i>/</i> COMPUTACIÓN</div><div className="session-badge">PARTIDA LOCAL <span>·</span> HASTA 4</div></header>
    {showExitConfirm&&<div className="how-to-backdrop" onClick={()=>setShowExitConfirm(false)}><section className="exit-dialog" role="alertdialog" aria-modal="true" aria-labelledby="exit-title" aria-describedby="exit-description" onClick={event=>event.stopPropagation()}><button className="how-to-close" type="button" aria-label="Cerrar confirmación" autoFocus onClick={()=>setShowExitConfirm(false)}><X size={18}/></button><div className="how-to-kicker">PARTIDA EN CURSO</div><h2 id="exit-title">¿Volver al menú principal?</h2><p id="exit-description">Si sales ahora, perderás el progreso de esta partida.</p><div className="exit-actions"><button type="button" className="stay-button" onClick={()=>setShowExitConfirm(false)}>Seguir jugando</button><button type="button" className="exit-button" onClick={returnToMenu}>Salir al menú</button></div></section></div>}
    {showHowToPlay&&<div className="how-to-backdrop" onClick={()=>setShowHowToPlay(false)}><section className="how-to-dialog" role="dialog" aria-modal="true" aria-labelledby="how-to-title" onClick={event=>event.stopPropagation()}><button className="how-to-close" type="button" aria-label="Cerrar reglas" autoFocus onClick={()=>setShowHowToPlay(false)}><X size={18}/></button><div className="how-to-kicker">JENGABYTE · BUAP</div><h2 id="how-to-title">Una torre, preguntas y buen pulso.</h2><p>JengaByte combina una partida local de Jenga con preguntas de computación. Juegan de 2 a 4 personas por turnos en el mismo equipo. Antes de empezar, elijan una dificultad para ajustar el nivel de las preguntas.</p><ol><li><b>Elige una pieza</b><span>Retira un bloque de cualquier nivel debajo de los tres superiores.</span></li><li><b>Responde el reto</b><span>El color de la pieza indica el tema de la pregunta.</span></li><li><b>Corona la torre</b><span>Si aciertas, coloca la pieza arriba. Si fallas, saca una pieza adicional antes de pasar el turno.</span></li></ol><p className="how-to-ending">La partida termina cuando la torre cae. ¡Gana quien logre mantenerla en pie!</p><div className="topic-list" aria-label="Temas de las preguntas">{categories.map(category=><span key={category.name}><i style={{background:category.color}}/>{category.name}</span>)}</div></section></div>}
    {!started ? <section className="welcome"><div className="welcome-copy"><div className="eyebrow"><span>FACULTAD DE CIENCIAS DE LA COMPUTACIÓN</span><span className="eyebrow-line" /></div><h1>Piensa antes<br/>de <em>mover.</em></h1><p>Retira un bloque, responde una pregunta de computación y vuelve a colocarlo arriba. Gana quien mantenga la torre en pie.</p><div className="setup"><div className="setup-title"><span>01</span> JUGADORES <span className="setup-note">HASTA 4 · MISMO ORDENADOR</span></div><div className="player-count">{[2,3,4].map(n=><button key={n} onClick={()=>setPlayerCount(n)} className={playerCount===n?'selected':''}>{n}</button>)}</div><div className="difficulty-control"><span className="difficulty-label">DIFICULTAD DE PREGUNTAS</span><div className="difficulty-picker" role="group" aria-label="Dificultad de las preguntas">{difficultyOptions.map(option=><button type="button" key={option.id} aria-pressed={difficulty===option.id} className={difficulty===option.id?'selected':''} onClick={()=>setDifficulty(option.id)}>{option.label}</button>)}</div><small>{difficultyOptions.find(option=>option.id===difficulty)?.hint}</small></div><div className="name-fields">{Array.from({length:playerCount},(_,i)=><div className="setup-player" key={i}><div className="setup-player-name"><span>{String(i+1).padStart(2,'0')}</span><input aria-label={`Nombre del jugador ${i+1}`} value={names[i]} placeholder={`Jugador ${i+1}`} onChange={e=>setNames(prev=>prev.map((v,j)=>j===i?e.target.value:v))}/><span className="player-preview" role="img" aria-label={`Vista previa: ${playerAvatars[avatarChoices[i]]} en ${['terracota','verde','azul','violeta','ocre'][colorChoices[i]]}`} style={{'--choice-color':playerColors[colorChoices[i]]} as React.CSSProperties}>{playerAvatars[avatarChoices[i]]}</span></div><div className="player-customize"><div className="avatar-picker" role="group" aria-label={`Avatar del jugador ${i+1}`}>{playerAvatars.map((avatar,option)=><button type="button" key={avatar} aria-label={`Avatar ${['lobo','zorro','panda','búho','rana'][option]}${avatarChoices.some((selected,j)=>j!==i&&j<playerCount&&selected===option)?' (ya elegido)':''}`} aria-pressed={avatarChoices[i]===option} disabled={avatarChoices.some((selected,j)=>j!==i&&j<playerCount&&selected===option)} className={avatarChoices[i]===option?'chosen':''} onClick={()=>setAvatarChoices(prev=>prev.map((v,j)=>j===i?option:v))}>{avatar}</button>)}</div><div className="color-picker" role="group" aria-label={`Color del jugador ${i+1}`}>{playerColors.map((color,option)=><button type="button" key={color} aria-label={`Color ${['terracota','verde','azul','violeta','ocre'][option]}${colorChoices.some((selected,j)=>j!==i&&j<playerCount&&selected===option)?' (ya elegido)':''}`} aria-pressed={colorChoices[i]===option} disabled={colorChoices.some((selected,j)=>j!==i&&j<playerCount&&selected===option)} className={colorChoices[i]===option?'chosen':''} style={{'--choice-color':color} as React.CSSProperties} onClick={()=>setColorChoices(prev=>prev.map((v,j)=>j===i?option:v))}/>)}</div></div></div>)}</div><button className="start-button" onClick={startGame}>Empezar partida <ArrowRight size={17}/></button><button type="button" className="how-to-button" onClick={()=>setShowHowToPlay(true)}><CircleHelp size={15}/> Cómo se juega</button></div><div className="welcome-bottom"><BookOpen size={15}/> 8 CATEGORÍAS <span>·</span> PREGUNTAS DE COMPUTACIÓN</div></div><div className="welcome-art"><div className="art-tag">JENGA <span>·</span> RETO DE COMPUTACIÓN</div><div className="welcome-tower" role="img" aria-label="Torre 3D de Jenga con 54 bloques"><WelcomeTower /></div><div className="welcome-mascot"><img src="/images/lobit.webp" alt="Lobit, mascota y guía del juego"/></div><div className="tower-piece-count"><b>54</b><span>PIEZAS<br/>EN JUEGO</span></div></div></section> : <>
      <div className="game-heading"><div><div className="eyebrow"><span>FACULTAD DE CIENCIAS DE LA COMPUTACIÓN</span><span className="eyebrow-line"/></div><h1>Jenga<em>Byte.</em></h1></div><div className="round-info"><span>RONDA</span><b>{String(Math.floor(removed.length / playerCount) + 1).padStart(2,'0')}</b><button className="menu-button" onClick={()=>setShowExitConfirm(true)} title="Volver al menú principal"><ArrowLeft size={14}/> MENÚ</button><button onClick={reset} title="Reiniciar partida"><RotateCcw size={15}/> REINICIAR</button></div></div>
      <section className="game-layout"><aside className="left-rail"><div className="rail-label">EN LA MESA <span>0{playerCount}</span></div><div className="players">{score.map((p,i)=><div className={`player ${p.active?'active':''}`} key={i}><span className="player-avatar" style={{'--player':p.color} as React.CSSProperties} aria-label={`Avatar de ${p.name}`}>{p.avatar}</span><span className="player-name">{p.name || `Jugador ${i+1}`}</span>{p.active&&<span className="turn-mark">JUEGA</span>}<b>{removed.filter((_,j)=>j%playerCount===i).length}</b></div>)}</div><div className="rail-divider"/><div className="rail-label">CATEGORÍAS <CircleHelp size={14}/></div><div className="category-list">{categories.map(c=><div key={c.name}><i style={{background:c.color}}/>{c.name}</div>)}</div><div className="small-tip"><span>↗</span> Gira la vista arrastrando el mouse.</div></aside>
        <div className="stage"><div className="stage-top"><span><i/> {phase==='pick'?'TU TURNO: HAZ CLIC EN UNA PIEZA':phase==='extracting'?'SACANDO LA PIEZA…':phase==='over'?'FIN DE LA PARTIDA':'RESPONDE LA PREGUNTA'}</span><button aria-expanded={showRules} onClick={()=>setShowRules(v=>!v)}>CÓMO JUGAR <ChevronDown size={14}/></button></div>{showRules&&<div className="rules-popover"><b>Tu turno en 3 pasos</b><span>1. Saca una pieza con un clic.</span><span>2. Responde la pregunta de su color.</span><span>3. Si aciertas, colócala arriba. Si fallas, saca una más.</span></div>}<div className="tower-stage-row"><div className={`tower-status vertical ${towerState}`}><div className="status-head"><span>ESTABILIDAD</span><b>{towerState==='fallen'?'CAÍDA':towerState==='moving'?'RIESGO':'ESTABLE'}</b></div><small className="stability-percent">{stabilityValue}%</small><div className="vertical-meter" role="meter" aria-label="Estabilidad de la torre" aria-valuemin={0} aria-valuemax={100} aria-valuenow={stabilityValue} aria-valuetext={`${stabilityValue}% de estabilidad`}><i style={{height:`${stabilityValue}%`}}/></div><div className="vertical-count"><b>{blocks.length-removed.length}</b><span>PIEZAS<br/>EN TORRE</span></div><small className="vertical-initial">54 INICIALES</small></div><div className="canvas-wrap"><Tower key={gameVersion} blocks={blocks} removed={removed} extractingId={extractingId} physicsActive={physicsActive} falling={falling} onPick={pickBlock} onTipping={onTipping} onCollapse={beginCollapse}/>{phase==='over'&&showFallOverlay&&<div className="fall-overlay"><span>FIN DE PARTIDA</span><h2>La torre <em>cayó.</em></h2><p>{currentName} hizo el último movimiento.</p><button onClick={reset}>Jugar otra vez <RotateCcw size={16}/></button></div>}</div></div><div className="stage-caption"><span><b>1</b> CLIC: SACA UNA PIEZA</span><span><b>2</b> RESPONDE SU PREGUNTA</span><span><b>3</b> ACIERTA: COLOCA ARRIBA · FALLA: SACA OTRA</span></div></div>
        <aside className="right-rail"><div className="turn-card"><div className="turn-kicker"><span className="live-dot"/> TURNO ACTUAL</div><h2>{currentName}<span>.</span></h2><p className="turn-message">{lastMessage}</p><Wolf mood={mood} advice={phase==='feedback'?question?.explain:undefined} correct={chosen===question?.answer}/></div>{(phase==='question'||phase==='feedback')&&question&&<div className={`question-card ${phase==='feedback'?'answered':''}`}>
          <div className="question-meta"><span style={{background:categories[picked?.cat??0].color}}/>{categories[picked?.cat??0].name.toUpperCase()}<b>{phase==='feedback'?'REVISA TU RESPUESTA':'ELIGE UNA RESPUESTA'}</b></div><h3>{question.q}</h3>
          <div className="answers">{options.map((option,i)=><button key={i} onClick={()=>answer(i)} disabled={chosen!==null} className={phase==='feedback'&&i===question.answer?'correct':phase==='feedback'&&i===chosen?'incorrect':''}><span className="answer-letter">{String.fromCharCode(65+i)}</span><span className="answer-text">{option}</span>{phase==='feedback'&&i===question.answer&&<span className="answer-badge">✓ Correcta</span>}{phase==='feedback'&&i===chosen&&i!==question.answer&&<span className="answer-badge wrong">✕ Incorrecta</span>}</button>)}</div>
          {phase==='feedback'&&<button className="continue-button" onClick={advance}>{chosen===question.answer?`Colocar ${pulledThisTurn.length} ${pulledThisTurn.length===1?'bloque':'bloques'} y pasar turno`:!wrongPull?'Retirar otro bloque':'Colocar bloques y pasar turno'} <ArrowRight size={16}/></button>}
        </div>}{phase==='extracting'&&<div className="instruction-card extracting-card"><div className="instruction-number">↔</div><div><b>Sacando el bloque</b><p>Espera un momento; observa si la torre se mueve.</p></div></div>}{phase==='pick'&&<div className="instruction-card"><div className="instruction-number">{wrongPull?'!':'01'}</div><div><b>{wrongPull?'Una pieza más':'Elige un bloque'}</b><p>{wrongPull?'Retira un bloque para cerrar este turno.':'Toca cualquier bloque de los niveles inferiores.'}</p></div></div>}</aside>
      </section><footer className="game-footer"><span>JENGABYTE BUAP <i>·</i> RETO DE LOBIT</span><span>UNA PARTIDA LOCAL <i>·</i> SIN CONEXIÓN</span></footer></>}
  </main>;
}
