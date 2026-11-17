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
  { q: '¿Qué algoritmo de ordenamiento intercambia elementos vecinos que están fuera de orden?', options: ['Búsqueda binaria', 'Burbuja', 'Dijkstra', 'Hashing'], answer: 1, explain: 'El algoritmo burbuja compara pares vecinos y los intercambia hasta ordenar la lista.' },
  { q: '¿Qué relación representa una clave foránea?', options: ['La conexión de una fila con otra tabla', 'El orden físico de los archivos', 'El nombre de la base de datos', 'La contraseña de un usuario'], answer: 0, explain: 'Una clave foránea referencia una clave de otra tabla y relaciona sus registros.' },
  { q: '¿Qué protocolo suele asignar direcciones IP automáticamente en una red?', options: ['DNS', 'DHCP', 'SMTP', 'SSH'], answer: 1, explain: 'DHCP entrega direcciones IP y otros parámetros de red a los dispositivos.' },
  { q: '¿Qué diferencia principal hay entre un proceso y un hilo?', options: ['Un hilo es una unidad de ejecución dentro de un proceso', 'Un proceso solo existe en redes', 'Un hilo siempre tiene su propia memoria aislada', 'No existe diferencia'], answer: 0, explain: 'Un proceso puede contener varios hilos que comparten su espacio de memoria.' },
  { q: '¿Qué API del navegador permite cambiar elementos de una página desde JavaScript?', options: ['DOM', 'DNS', 'SQL', 'SSH'], answer: 0, explain: 'El DOM representa la estructura del documento y permite consultarla o modificarla.' },
  { q: '¿Qué práctica de diseño divide un sistema en módulos con responsabilidades claras?', options: ['Alta cohesión y bajo acoplamiento', 'Duplicación de lógica', 'Dependencia circular', 'Despliegue manual'], answer: 0, explain: 'Los módulos cohesivos y poco acoplados son más fáciles de mantener y probar.' },
  { q: '¿Qué diferencia a cifrar de aplicar un hash?', options: ['El cifrado puede revertirse con una clave; el hash está diseñado como operación de una sola vía', 'El hash siempre necesita una contraseña', 'El cifrado solo funciona con imágenes', 'No hay diferencia'], answer: 0, explain: 'El cifrado permite recuperar el contenido con la clave; un hash no está pensado para invertirse.' },
  { q: '¿Qué recurso de una computadora conserva datos aunque se apague?', options: ['Memoria RAM', 'Caché L1', 'Almacenamiento SSD', 'Registro de CPU'], answer: 2, explain: 'El SSD es almacenamiento no volátil, por lo que conserva archivos sin energía.' },
  { q: '¿Qué estructura de datos permite buscar valores por una clave usando una función hash?', options: ['Tabla hash', 'Pila', 'Cola circular', 'Lista enlazada simple'], answer: 0, explain: 'Una tabla hash calcula una posición a partir de la clave para localizar valores rápidamente.' },
  { q: '¿Qué operación SQL combina filas relacionadas de dos tablas?', options: ['JOIN', 'DROP', 'COMMIT', 'ALTER'], answer: 0, explain: 'JOIN combina registros de tablas relacionadas mediante una condición de unión.' },
  { q: '¿Qué mecanismo de TCP controla la cantidad de datos enviados antes de recibir confirmación?', options: ['Ventana deslizante', 'Resolución DNS', 'Máscara de subred', 'Puerto serial'], answer: 0, explain: 'La ventana deslizante regula los datos en tránsito y contribuye al control de flujo.' },
  { q: '¿Qué memoria virtual usa el sistema operativo cuando la RAM disponible no alcanza?', options: ['Espacio de intercambio en disco', 'Caché del navegador', 'ROM del teclado', 'Buffer de video'], answer: 0, explain: 'El sistema puede mover temporalmente páginas de memoria al disco mediante swap o archivo de paginación.' },
  { q: '¿Qué atributo HTML asocia una etiqueta con su campo de formulario?', options: ['for', 'src', 'alt', 'target'], answer: 0, explain: 'El atributo for de label referencia el id del control correspondiente.' },
  { q: '¿Qué práctica integra cambios de código con frecuencia y ejecuta validaciones automáticas?', options: ['Integración continua', 'Prototipado en papel', 'Normalización', 'Cifrado simétrico'], answer: 0, explain: 'La integración continua incorpora cambios frecuentes y ejecuta compilaciones y pruebas automatizadas.' },
  { q: '¿Qué hace una función hash criptográfica con una entrada de longitud variable?', options: ['Produce un resumen de longitud fija', 'La cifra con una clave privada', 'La comprime siempre sin pérdida', 'La convierte en una dirección IP'], answer: 0, explain: 'Una función hash genera un resumen de longitud fija y está diseñada para resistir colisiones.' },
  { q: '¿Qué componente suele acelerar el acceso repetido a datos recientes del procesador?', options: ['Memoria caché', 'Tarjeta de sonido', 'Fuente de poder', 'Unidad óptica'], answer: 0, explain: 'La caché guarda datos usados recientemente cerca del procesador para reducir el tiempo de acceso.' },
  { q: '¿Qué paradigma organiza el código en objetos que combinan estado y comportamiento?', options: ['Programación orientada a objetos', 'Programación lógica', 'Programación por lotes', 'Programación reactiva exclusivamente'], answer: 0, explain: 'La orientación a objetos modela entidades como objetos con datos y métodos.' },
  { q: '¿Qué clave puede estar formada por más de una columna para identificar una fila?', options: ['Clave compuesta', 'Clave temporal', 'Clave de caché', 'Clave de ordenamiento'], answer: 0, explain: 'Una clave compuesta usa dos o más columnas para identificar de forma única una fila.' },
  { q: '¿Qué técnica divide una red IP en segmentos más pequeños?', options: ['Subnetting', 'Enrutamiento de archivos', 'Compresión', 'Virtualización de memoria'], answer: 0, explain: 'Subnetting divide un bloque de direcciones en subredes más pequeñas.' },
  { q: '¿Qué sucede durante un cambio de contexto del sistema operativo?', options: ['Se guarda el estado de un proceso y se carga el de otro', 'Se cambia el nombre del archivo', 'Se elimina la memoria permanente', 'Se traduce un dominio a una IP'], answer: 0, explain: 'El sistema operativo guarda el estado del proceso que sale y restaura el del que entra a ejecutarse.' },
  { q: '¿Qué atributo HTML conecta un botón con un control de formulario?', options: ['form', 'alt', 'lang', 'rel'], answer: 0, explain: 'El atributo form puede asociar un control con el formulario identificado por su id.' },
  { q: '¿Qué es la refactorización de código?', options: ['Mejorar su estructura interna conservando su comportamiento', 'Agregar una función sin revisar el código', 'Eliminar todas las pruebas', 'Cambiar el lenguaje de programación'], answer: 0, explain: 'Refactorizar reorganiza el código para facilitar su mantenimiento sin cambiar lo que hace.' },
  { q: '¿Qué principio recomienda conceder solo los permisos indispensables?', options: ['Mínimo privilegio', 'Disponibilidad total', 'Confianza implícita', 'Acceso anónimo'], answer: 0, explain: 'El mínimo privilegio reduce el acceso de cada cuenta a lo necesario para su tarea.' },
  { q: '¿Para qué sirve un regulador o UPS en un equipo de cómputo?', options: ['Mantener energía temporal y proteger ante cortes', 'Aumentar la capacidad del disco', 'Traducir direcciones IP', 'Actualizar el navegador'], answer: 0, explain: 'Un UPS puede dar energía temporal y proteger el equipo ante interrupciones eléctricas.' },
  { q: '¿Qué ventaja tiene el acceso por índice en un arreglo?', options: ['Permite acceder directamente a una posición', 'Ordena automáticamente sus valores', 'Elimina duplicados', 'Cifra sus elementos'], answer: 0, explain: 'En un arreglo, una posición conocida suele poder consultarse directamente en tiempo constante.' },
  { q: '¿Qué problema puede resolver un índice de base de datos?', options: ['Reducir filas examinadas al buscar', 'Reemplazar toda restricción', 'Cifrar automáticamente una tabla', 'Eliminar la necesidad de copias de seguridad'], answer: 0, explain: 'Un índice puede acelerar búsquedas, aunque ocupa espacio y añade costo a algunas escrituras.' },
  { q: '¿Qué protocolo protege normalmente el contenido de una conexión HTTPS?', options: ['TLS', 'ARP', 'DHCP', 'POP3 sin cifrado'], answer: 0, explain: 'HTTPS usa TLS para proteger la comunicación HTTP entre cliente y servidor.' },
  { q: '¿Qué condición necesaria para un interbloqueo describe un recurso que no se puede quitar por la fuerza?', options: ['No apropiación', 'Espera circular', 'Exclusión mutua', 'Retención y espera'], answer: 0, explain: 'En la condición de no apropiación, un recurso no se retira: el proceso debe liberarlo voluntariamente.' },
  { q: '¿Qué estado HTTP indica que un recurso se encontró sin necesidad de cambios?', options: ['200', '301', '404', '500'], answer: 0, explain: '200 OK indica que la solicitud se atendió correctamente.' },
  { q: '¿Qué función cumple una rama en Git?', options: ['Permite desarrollar cambios aislados del historial principal', 'Cifra automáticamente todos los archivos', 'Ejecuta la aplicación en el navegador', 'Sustituye el sistema operativo'], answer: 0, explain: 'Las ramas separan líneas de trabajo para desarrollar cambios antes de integrarlos.' },
  { q: '¿Qué diferencia a la autenticación de la autorización?', options: ['La primera verifica identidad; la segunda define permisos', 'La primera cifra archivos; la segunda los comprime', 'Son exactamente lo mismo', 'La autorización siempre ocurre antes de conocer la identidad'], answer: 0, explain: 'Autenticar verifica quién eres; autorizar decide qué acciones puedes realizar.' },
  { q: '¿Qué factor describe cuántos núcleos de CPU tiene un procesador?', options: ['Paralelismo de hardware', 'Resolución de pantalla', 'Capacidad de almacenamiento', 'Frecuencia de red'], answer: 0, explain: 'Los núcleos permiten que el procesador ejecute varios hilos en paralelo, según la carga y el software.' },
  { q: '¿Qué tipo de dato suele representar una colección indexada de elementos?', options: ['Arreglo', 'Booleano', 'Puntero nulo', 'Cadena vacía'], answer: 0, explain: 'Un arreglo almacena varios elementos accesibles por su posición.' },
  { q: '¿Qué propiedad de una transacción ACID mantiene la base válida antes y después de ejecutarla?', options: ['Consistencia', 'Atomicidad', 'Aislamiento', 'Durabilidad'], answer: 0, explain: 'La consistencia mantiene las reglas e invariantes de la base al confirmar una transacción.' },
  { q: '¿Qué campo de un paquete IP indica el siguiente protocolo de transporte?', options: ['Protocol o Next Header', 'TTL únicamente', 'Máscara de pantalla', 'Número de serie del disco'], answer: 0, explain: 'Ese campo indica qué protocolo de capa superior debe procesar la carga, por ejemplo TCP o UDP.' },
  { q: '¿Qué problema puede causar una condición de carrera?', options: ['Resultados dependientes del orden de acceso concurrente', 'Que un dominio no tenga nombre', 'Que una pantalla tenga más píxeles', 'Que una tabla use una clave primaria'], answer: 0, explain: 'Una condición de carrera aparece cuando el resultado depende de accesos concurrentes no coordinados.' },
  { q: '¿Qué método HTTP suele usarse para solicitar una representación sin modificar el recurso?', options: ['GET', 'DELETE', 'PATCH', 'POST'], answer: 0, explain: 'GET solicita una representación y, por convención, no debe modificar el estado del recurso.' },
  { q: '¿Qué actividad de Scrum permite inspeccionar el incremento y adaptar el trabajo con interesados?', options: ['Sprint Review', 'Daily Scrum', 'Refinamiento técnico obligatorio', 'Retrospectiva personal'], answer: 0, explain: 'La Sprint Review inspecciona el resultado del sprint y considera cambios con las partes interesadas.' },
  { q: '¿Qué aporta la firma digital basada en criptografía de clave pública?', options: ['Autenticidad e integridad verificables', 'Ocultamiento automático del texto firmado', 'Recuperación de contraseñas', 'Compresión sin pérdida'], answer: 0, explain: 'Una firma permite verificar quién firmó y que el contenido no cambió; no lo cifra por sí sola.' },
  { q: '¿Qué unidad suele medir la capacidad de almacenamiento de un dispositivo?', options: ['GB', 'GHz', 'Voltios por metro', 'Píxeles por pulgada'], answer: 0, explain: 'Los gigabytes expresan una cantidad de almacenamiento digital.' },
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
  { q: '¿Qué estructura permite repetir instrucciones mientras una condición sea verdadera?', options: ['Un ciclo', 'Una constante', 'Un comentario', 'Un archivo'], answer: 0, explain: 'Un ciclo repite un bloque de instrucciones mientras se cumpla la condición definida.' },
  { q: '¿Qué campo identifica de forma única cada fila de una tabla?', options: ['Clave primaria', 'Campo de texto', 'Filtro', 'Vista'], answer: 0, explain: 'La clave primaria distingue cada registro y no debe repetirse.' },
  { q: '¿Qué servicio asigna automáticamente una dirección IP a un equipo?', options: ['DNS', 'DHCP', 'HTML', 'USB'], answer: 1, explain: 'DHCP entrega automáticamente la configuración de red, incluida una dirección IP.' },
  { q: '¿Qué interfaz permite interactuar con un sistema usando ventanas e iconos?', options: ['Interfaz gráfica', 'Procesador', 'Memoria RAM', 'Cable de red'], answer: 0, explain: 'Una interfaz gráfica presenta controles visuales como ventanas, botones e iconos.' },
  { q: '¿Qué lenguaje se utiliza para dar estilo y color a una página web?', options: ['CSS', 'SQL', 'Bash', 'CSV'], answer: 0, explain: 'CSS define la presentación visual de los elementos de una página.' },
  { q: '¿Qué ayuda a encontrar y corregir errores en un programa?', options: ['Depuración', 'Compresión', 'Impresión', 'Descarga'], answer: 0, explain: 'La depuración permite revisar la ejecución para localizar y corregir fallos.' },
  { q: '¿Qué debes hacer si recibes un enlace sospechoso por mensaje?', options: ['Abrirlo para comprobarlo', 'Compartirlo con todos', 'No abrirlo y verificar al remitente', 'Escribir tu contraseña'], answer: 2, explain: 'Verificar el remitente antes de abrir un enlace ayuda a evitar fraudes y phishing.' },
  { q: '¿Qué componente ejecuta instrucciones de los programas?', options: ['CPU', 'Monitor', 'Bocina', 'Cámara'], answer: 0, explain: 'La CPU procesa instrucciones y coordina operaciones del equipo.' },
  { q: '¿Qué operador lógico requiere que dos condiciones sean verdaderas?', options: ['AND', 'OR', 'NOT', 'XOR'], answer: 0, explain: 'AND solo resulta verdadero si ambas condiciones lo son.' },
  { q: '¿Qué instrucción SQL modifica datos que ya existen?', options: ['UPDATE', 'SELECT', 'CREATE', 'SHOW'], answer: 0, explain: 'UPDATE cambia los valores de una o más filas existentes.' },
  { q: '¿Qué identifica una dirección IP dentro de una red?', options: ['Un dispositivo', 'Una contraseña', 'Un archivo', 'Un programa'], answer: 0, explain: 'Una dirección IP identifica un dispositivo para que pueda comunicarse en una red.' },
  { q: '¿Qué permite al sistema operativo ejecutar varias aplicaciones abiertas?', options: ['La gestión de procesos', 'El formato de imagen', 'La conexión HDMI', 'El lenguaje HTML'], answer: 0, explain: 'El sistema operativo administra los procesos para repartir recursos entre las aplicaciones.' },
  { q: '¿Qué etiqueta HTML crea un enlace?', options: ['<a>', '<p>', '<img>', '<table>'], answer: 0, explain: 'El elemento <a> crea un enlace a otra página o recurso.' },
  { q: '¿Qué herramienta conserva versiones anteriores del código?', options: ['Git', 'Paint', 'Calculadora', 'Bloc de notas'], answer: 0, explain: 'Git registra cambios y permite consultar o recuperar versiones del código.' },
  { q: '¿Qué agrega una segunda capa de protección al iniciar sesión?', options: ['Autenticación de dos factores', 'Un nombre de usuario más largo', 'Una pestaña nueva', 'Un archivo comprimido'], answer: 0, explain: 'La autenticación de dos factores solicita una prueba adicional además de la contraseña.' },
  { q: '¿Qué memoria pierde su contenido al apagar la computadora?', options: ['RAM', 'SSD', 'Disco duro', 'Memoria USB'], answer: 0, explain: 'La RAM guarda temporalmente datos de trabajo y se borra al apagar el equipo.' },
  { q: '¿Qué palabra reserva un espacio para un valor que puede cambiar en un programa?', options: ['Variable', 'Etiqueta HTML', 'Tabla SQL', 'Dirección IP'], answer: 0, explain: 'Una variable almacena un valor que el programa puede consultar o actualizar.' },
  { q: '¿Qué cláusula SQL filtra filas según una condición?', options: ['WHERE', 'ORDER BY', 'CREATE', 'GRANT'], answer: 0, explain: 'WHERE selecciona las filas que cumplen una condición.' },
  { q: '¿Cómo se llama una red que conecta dispositivos en un área pequeña, como una casa?', options: ['LAN', 'WAN', 'VPN', 'SAN'], answer: 0, explain: 'Una LAN conecta dispositivos en un espacio limitado, como una casa, oficina o escuela.' },
  { q: '¿Qué permite organizar documentos en una computadora?', options: ['Carpetas', 'Píxeles', 'Paquetes de red', 'Consultas'], answer: 0, explain: 'Las carpetas agrupan archivos para organizarlos dentro del sistema de archivos.' },
  { q: '¿Qué atributo de una imagen ayuda a describirla a quien usa un lector de pantalla?', options: ['alt', 'href', 'class', 'style'], answer: 0, explain: 'El texto alternativo describe el contenido o función de la imagen para tecnologías de asistencia.' },
  { q: '¿Qué suele describir una historia de usuario?', options: ['Una necesidad desde el punto de vista de quien usará el producto', 'La contraseña del servidor', 'El cableado del laboratorio', 'El orden de los archivos del sistema'], answer: 0, explain: 'Una historia de usuario expresa una necesidad y el valor que espera obtener una persona usuaria.' },
  { q: '¿Qué acción ayuda a proteger una sesión en una computadora compartida?', options: ['Cerrar sesión al terminar', 'Dejar la cuenta abierta', 'Anotar la contraseña en la pantalla', 'Desactivar el bloqueo'], answer: 0, explain: 'Cerrar la sesión evita que otras personas accedan a la cuenta desde el mismo equipo.' },
  { q: '¿Qué dispositivo convierte instrucciones en imágenes para la pantalla?', options: ['Tarjeta gráfica', 'Router', 'Micrófono', 'Fuente de poder'], answer: 0, explain: 'La tarjeta gráfica procesa y envía la salida visual al monitor.' },
  { q: '¿Qué tipo de dato representa valores como verdadero o falso?', options: ['Booleano', 'Imagen', 'Fecha', 'Dirección'], answer: 0, explain: 'Un valor booleano representa uno de dos estados lógicos: verdadero o falso.' },
  { q: '¿Qué cláusula SQL ordena los resultados de una consulta?', options: ['ORDER BY', 'WHERE', 'INSERT', 'DROP'], answer: 0, explain: 'ORDER BY ordena las filas devueltas por una consulta.' },
  { q: '¿Qué tecnología permite conectar dispositivos a una red local sin cable?', options: ['Wi-Fi', 'HDMI', 'SATA', 'VGA'], answer: 0, explain: 'Wi-Fi permite que los dispositivos se conecten a una red mediante señales inalámbricas.' },
  { q: '¿Qué tipo de software recibe actualizaciones para corregir errores y mejorar seguridad?', options: ['Sistema operativo', 'Cable USB', 'Monitor', 'Teclado'], answer: 0, explain: 'Actualizar el sistema operativo ayuda a corregir fallas y mantener protecciones recientes.' },
  { q: '¿Qué propiedad CSS cambia el color del texto?', options: ['color', 'padding', 'display', 'margin'], answer: 0, explain: 'La propiedad color define el color de primer plano del texto.' },
  { q: '¿Qué documento explica cómo reproducir un error encontrado en una aplicación?', options: ['Reporte de bug', 'Mapa del sitio', 'Factura', 'Licencia de red'], answer: 0, explain: 'Un reporte de bug describe el comportamiento observado y los pasos para reproducirlo.' },
  { q: '¿Por qué conviene instalar actualizaciones de seguridad?', options: ['Corrigen vulnerabilidades conocidas', 'Aumentan el tamaño de la pantalla', 'Revelan contraseñas', 'Desconectan el router'], answer: 0, explain: 'Las actualizaciones pueden corregir fallos que atacantes ya conocen y aprovechan.' },
  { q: '¿Qué unidad suele describir la rapidez de un procesador?', options: ['GHz', 'Litros', 'Pulgadas', 'Decibelios'], answer: 0, explain: 'Los GHz expresan miles de millones de ciclos por segundo; no son la única medida del rendimiento.' },
  { q: '¿Qué instrucción ejecuta un bloque solo cuando una condición se cumple?', options: ['if', 'array', 'return type', 'import'], answer: 0, explain: 'Una condición if permite tomar una decisión en el flujo del programa.' },
  { q: '¿Qué función SQL cuenta cuántas filas devuelve una consulta?', options: ['COUNT', 'SUM', 'LOWER', 'ROUND'], answer: 0, explain: 'COUNT cuenta filas o valores dentro del resultado de una consulta.' },
  { q: '¿Qué medio transmite datos por una conexión Ethernet cableada?', options: ['Cable de red', 'Bocina', 'Cable de audio', 'Pantalla táctil'], answer: 0, explain: 'Ethernet suele conectar equipos a la red local mediante un cable de red.' },
  { q: '¿Qué opción permite eliminar un archivo desde la interfaz del sistema?', options: ['Moverlo a la papelera', 'Cambiar el fondo', 'Aumentar el volumen', 'Abrir una pestaña'], answer: 0, explain: 'La papelera permite retirar archivos y, en muchos sistemas, recuperarlos antes de vaciarla.' },
  { q: '¿Qué etiqueta HTML representa un párrafo?', options: ['<p>', '<img>', '<nav>', '<form>'], answer: 0, explain: 'El elemento <p> representa un párrafo de texto.' },
  { q: '¿Qué guarda un sistema de control de versiones como Git?', options: ['Historial de cambios en archivos', 'La carga de la batería', 'La señal Wi-Fi', 'La resolución del monitor'], answer: 0, explain: 'Git registra cambios a lo largo del tiempo y facilita comparar versiones del proyecto.' },
  { q: '¿Cuál es una buena práctica para las contraseñas de distintas cuentas?', options: ['Usar una contraseña única para cada cuenta', 'Repetir la misma en todas', 'Compartirla por chat', 'Usar solo el nombre propio'], answer: 0, explain: 'Las contraseñas únicas limitan el daño si una cuenta o servicio se ve comprometido.' },
  { q: '¿Qué suele guardar una copia de seguridad?', options: ['Una copia recuperable de archivos importantes', 'La velocidad del ventilador', 'El color del teclado', 'La dirección de una página abierta'], answer: 0, explain: 'Una copia de seguridad conserva una versión de los datos para recuperarlos ante pérdida o daño.' },
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
  { q: '¿Qué estructura permite obtener el elemento mínimo en O(1) después de construirla?', options: ['Montículo mínimo', 'Lista doblemente enlazada', 'Pila', 'Árbol binario de búsqueda sin balancear'], answer: 0, explain: 'En un montículo mínimo, el elemento menor se mantiene en la raíz y se consulta en tiempo constante.' },
  { q: '¿Qué técnica de programación dinámica evita recalcular resultados de subproblemas?', options: ['Memoización', 'Recursión sin condición base', 'Búsqueda lineal', 'Concatenación de cadenas'], answer: 0, explain: 'La memoización almacena resultados ya calculados para reutilizarlos cuando aparece el mismo subproblema.' },
  { q: '¿Qué propiedad ACID garantiza que una transacción se complete por completo o no se aplique?', options: ['Atomicidad', 'Consistencia', 'Aislamiento', 'Durabilidad'], answer: 0, explain: 'La atomicidad trata una transacción como una unidad indivisible: se confirma completa o se revierte.' },
  { q: '¿Qué protocolo de transporte no establece conexión y no garantiza la entrega?', options: ['TCP', 'UDP', 'TLS', 'SFTP'], answer: 1, explain: 'UDP envía datagramas sin establecer una conexión ni garantizar recepción u orden.' },
  { q: '¿Qué condición puede producir un interbloqueo entre procesos?', options: ['Espera circular por recursos retenidos', 'Todos los procesos usan CPU', 'Un archivo se lee secuencialmente', 'Una aplicación tiene un solo hilo'], answer: 0, explain: 'La espera circular ocurre cuando cada proceso espera un recurso retenido por otro.' },
  { q: '¿Qué política de mismo origen restringe en el navegador?', options: ['El acceso entre documentos de distintos orígenes', 'La longitud de las URL', 'El uso de etiquetas semánticas', 'La creación de tablas SQL'], answer: 0, explain: 'Same-Origin Policy limita cómo un documento accede a recursos de otro origen.' },
  { q: '¿Qué principio de diseño busca que un módulo tenga una sola razón para cambiar?', options: ['Responsabilidad única', 'Sustitución de Liskov', 'Inversión de dependencias', 'Segregación de interfaces'], answer: 0, explain: 'El principio de responsabilidad única recomienda que un módulo tenga una responsabilidad bien delimitada.' },
  { q: '¿Qué ataque intenta engañar a una persona para que revele credenciales mediante mensajes falsos?', options: ['Phishing', 'Fuerza bruta', 'Desbordamiento de búfer', 'Escaneo de puertos'], answer: 0, explain: 'El phishing suplanta una fuente confiable para inducir a revelar información o ejecutar acciones.' },
  { q: '¿Qué técnica distribuye solicitudes entre varios servidores para evitar saturar uno solo?', options: ['Balanceo de carga', 'Fragmentación de disco', 'Resolución de nombres', 'Compilación incremental'], answer: 0, explain: 'El balanceo de carga reparte el tráfico entre varios servidores para mejorar disponibilidad y capacidad.' },
  { q: '¿Qué anomalía evita la serialización en bases de datos?', options: ['Resultados distintos a los de una ejecución secuencial equivalente', 'La necesidad de índices', 'El almacenamiento de fechas', 'El uso de claves primarias'], answer: 0, explain: 'La serialización garantiza que una ejecución concurrente equivalga a algún orden secuencial válido.' },
  { q: '¿Qué técnica permite que varios equipos compartan una sola dirección IPv4 pública?', options: ['NAT', 'ARP', 'ICMP', 'NTP'], answer: 0, explain: 'NAT traduce direcciones entre redes, comúnmente permitiendo que varios equipos usen una IP pública.' },
  { q: '¿Qué estrategia de reemplazo de páginas expulsa la que lleva más tiempo sin usarse?', options: ['LRU', 'FIFO circular únicamente', 'Round robin', 'Best fit'], answer: 0, explain: 'LRU reemplaza la página que menos recientemente fue utilizada.' },
  { q: '¿Qué encabezado ayuda a mitigar ataques de clickjacking al impedir que una página se incruste en un marco?', options: ['Content-Security-Policy frame-ancestors', 'Accept-Language', 'Cache-Control', 'Content-Length'], answer: 0, explain: 'La directiva frame-ancestors de CSP controla qué sitios pueden incrustar la página.' },
  { q: '¿Qué garantiza una prueba de propiedad en desarrollo guiado por pruebas?', options: ['Una propiedad general para múltiples entradas', 'Un único ejemplo fijo de interfaz', 'La ausencia de toda falla posible', 'La velocidad máxima de la base de datos'], answer: 0, explain: 'Las pruebas de propiedad generan numerosas entradas para verificar una regla general del sistema.' },
  { q: '¿Qué algoritmo de intercambio de claves permite acordar un secreto sin enviarlo directamente?', options: ['Diffie-Hellman', 'MD5', 'AES en modo ECB', 'CRC32'], answer: 0, explain: 'Diffie-Hellman permite derivar un secreto compartido a través de un canal público.' },
  { q: '¿Qué nivel de RAID distribuye datos y paridad para tolerar la falla de un disco?', options: ['RAID 5', 'RAID 0', 'JBOD', 'RAID 1 sin duplicación'], answer: 0, explain: 'RAID 5 distribuye datos y paridad entre los discos y puede tolerar la falla de uno.' },
  { q: '¿Qué propiedad debe conservar un algoritmo de ordenamiento estable?', options: ['El orden relativo de elementos con claves iguales', 'La misma cantidad de memoria en toda implementación', 'Un tiempo O(1) para todas las entradas', 'Que la entrada no contenga duplicados'], answer: 0, explain: 'Un ordenamiento estable conserva el orden original de los elementos que tienen claves iguales.' },
  { q: '¿Qué anomalía puede ocurrir si una consulta de rango se repite tras una inserción concurrente?', options: ['Lectura fantasma', 'Lectura sucia', 'Escritura perdida necesariamente', 'Cifrado reversible'], answer: 0, explain: 'Una lectura fantasma aparece cuando repetir una consulta de rango devuelve filas nuevas por cambios concurrentes.' },
  { q: '¿Qué protocolo de enrutamiento intercambia rutas entre sistemas autónomos en internet?', options: ['BGP', 'DHCP', 'DNS', 'NFS'], answer: 0, explain: 'BGP intercambia información de rutas entre sistemas autónomos.' },
  { q: '¿Qué técnica crea páginas privadas solo cuando un proceso escribe en una página compartida?', options: ['Copy-on-write', 'Round robin', 'Spooling', 'Polling activo'], answer: 0, explain: 'Copy-on-write comparte páginas hasta que una escritura requiere crear una copia privada.' },
  { q: '¿Qué control del navegador permite que un servidor autorice solicitudes desde otros orígenes?', options: ['CORS', 'DOM', 'ARIA', 'WebSocket local'], answer: 0, explain: 'CORS permite que el servidor autorice solicitudes de otros orígenes mediante encabezados.' },
  { q: '¿Qué indica una cobertura de código alta por sí sola?', options: ['Que se ejecutó mucho código, pero no que cada conducta esté bien comprobada', 'Que el sistema está libre de errores', 'Que no hacen falta pruebas de integración', 'Que el rendimiento es óptimo'], answer: 0, explain: 'La cobertura mide qué código se ejecutó; no mide por sí sola la calidad de las aserciones.' },
  { q: '¿Qué aporta un HMAC a un mensaje?', options: ['Autenticación e integridad mediante una clave compartida', 'Cifrado asimétrico', 'Compresión de datos', 'Resolución de direcciones IP'], answer: 0, explain: 'HMAC combina un hash con una clave secreta para verificar integridad y autenticidad.' },
  { q: '¿Qué algoritmo divide el trabajo en subproblemas y combina las soluciones?', options: ['Divide y vencerás', 'Búsqueda exhaustiva aleatoria', 'Codificación Base64', 'Planificación round robin'], answer: 0, explain: 'Divide y vencerás resuelve subproblemas, normalmente recursivos, y combina sus soluciones.' },
  { q: '¿Qué propiedad ACID evita que transacciones concurrentes interfieran sin control?', options: ['Aislamiento', 'Atomicidad', 'Durabilidad', 'Consistencia'], answer: 0, explain: 'El aislamiento controla los efectos visibles entre transacciones concurrentes.' },
  { q: '¿Qué ataque intenta agotar los recursos de un servicio mediante muchas solicitudes?', options: ['Denegación de servicio', 'Resolución inversa', 'Fragmentación SQL', 'Compilación incremental'], answer: 0, explain: 'Un ataque de denegación de servicio consume recursos para degradar o impedir la atención del servicio.' },
  { q: '¿Qué algoritmo de reemplazo de páginas expulsa la que lleva más tiempo sin utilizarse?', options: ['LRU', 'FIFO necesariamente', 'Round robin', 'Best fit'], answer: 0, explain: 'LRU reemplaza la página que se usó menos recientemente.' },
  { q: '¿Qué práctica impide que una entrada no confiable se interprete como código HTML o JavaScript?', options: ['Codificación de salida según el contexto', 'Desactivar el encabezado Host', 'Cambiar el color del formulario', 'Usar consultas SQL más rápidas'], answer: 0, explain: 'Codificar la salida según su contexto evita que contenido no confiable se interprete como marcado o script.' },
  { q: '¿Qué modelo entrega incrementos funcionales en ciclos cortos y repetidos?', options: ['Iterativo e incremental', 'Big bang sin entregas', 'Secuencial sin retroalimentación', 'Codificación sin requisitos'], answer: 0, explain: 'El desarrollo iterativo e incremental entrega partes utilizables y aprende de cada ciclo.' },
  { q: '¿Qué aporta AES-GCM además de cifrar el contenido?', options: ['Una etiqueta para verificar integridad y autenticidad', 'Una función de compresión', 'Un intercambio de rutas', 'Una contraseña recuperable'], answer: 0, explain: 'GCM produce texto cifrado y una etiqueta de autenticación para detectar alteraciones.' },
  { q: '¿Qué característica de una GPU permite procesar muchas operaciones independientes a la vez?', options: ['Numerosos núcleos para cómputo paralelo', 'Almacenamiento persistente de archivos', 'Asignación de direcciones IP', 'Control de transacciones SQL'], answer: 0, explain: 'Las GPU contienen numerosos núcleos que pueden trabajar en grandes cantidades de operaciones paralelas.' },
  { q: '¿Qué complejidad amortizada tiene insertar al final en un arreglo dinámico que duplica su capacidad?', options: ['O(1)', 'O(log n) siempre', 'O(n²)', 'O(2ⁿ)'], answer: 0, explain: 'Aunque algunas ampliaciones cuestan O(n), repartido entre muchas inserciones el costo amortizado es O(1).' },
  { q: '¿Qué ventaja ofrece un índice cubriente para una consulta?', options: ['Puede responderla sin consultar filas adicionales de la tabla', 'Impide que se inserten filas', 'Cifra automáticamente los datos', 'Reemplaza todas las claves foráneas'], answer: 0, explain: 'Un índice cubriente contiene las columnas necesarias para responder una consulta sin leer la tabla base.' },
  { q: '¿Qué hace el campo TTL de un paquete IPv4?', options: ['Limita cuántos saltos puede recorrer', 'Cifra la carga útil', 'Identifica al usuario', 'Mide la velocidad del enlace'], answer: 0, explain: 'Cada router reduce TTL; al llegar a cero, el paquete se descarta para evitar circulación indefinida.' },
  { q: '¿Qué mecanismo protege una sección crítica permitiendo un solo hilo a la vez?', options: ['Mutex', 'Caché', 'Compilador', 'Balanceador'], answer: 0, explain: 'Un mutex es un bloqueo exclusivo que protege una sección crítica compartida.' },
  { q: '¿Qué solicitud suele enviar un navegador antes de una petición CORS no simple?', options: ['OPTIONS de preflight', 'Consulta DHCP', 'Transferencia SMTP', 'GET a robots.txt'], answer: 0, explain: 'El navegador puede enviar OPTIONS para comprobar qué permite el servidor antes de la solicitud real.' },
  { q: '¿Qué documento registra una decisión arquitectónica y sus motivos?', options: ['ADR', 'Lista de contraseñas', 'Archivo de intercambio', 'Mapa de calor de CPU'], answer: 0, explain: 'Un ADR documenta una decisión arquitectónica, su contexto y las consecuencias consideradas.' },
  { q: '¿Qué valor único puede usar un protocolo para rechazar mensajes capturados y repetidos?', options: ['Nonce', 'Checksum sin estado', 'Nombre de dominio', 'Máscara de subred'], answer: 0, explain: 'Un nonce de un solo uso permite detectar o evitar la repetición de mensajes.' },
  { q: '¿Qué práctica mejora la disponibilidad si una instancia de servidor falla?', options: ['Redundancia con conmutación por error', 'Guardar una sola copia local', 'Desactivar alertas', 'Usar una cuenta compartida'], answer: 0, explain: 'La redundancia y el failover permiten que otra instancia atienda si una falla.' },
  { q: '¿Qué mide un porcentaje de disponibilidad de un servicio?', options: ['La fracción del tiempo en que estuvo operativo', 'La cantidad de contraseñas almacenadas', 'El número de núcleos del servidor', 'La longitud de las direcciones IP'], answer: 0, explain: 'La disponibilidad expresa qué proporción de un periodo el servicio estuvo funcionando según lo esperado.' },
];
const questionSets: Record<Difficulty, Question[]> = { facil: easyQuestions, intermedia: questions, dificil: hardQuestions };
type QuestionDecks = Record<Difficulty, Question[]>;
type QuestionHistory = Record<Difficulty, string[]>;
const QUESTION_HISTORY_KEY = 'jengabyte-question-history-v1';
function loadQuestionHistory(): QuestionHistory {
  const empty: QuestionHistory = { facil: [], intermedia: [], dificil: [] };
  if (typeof window === 'undefined') return empty;
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(QUESTION_HISTORY_KEY) ?? '{}') as Partial<Record<Difficulty, unknown>>;
    return Object.fromEntries((Object.keys(empty) as Difficulty[]).map(level => [
      level,
      Array.isArray(stored[level]) ? stored[level].filter((question): question is string => typeof question === 'string') : [],
    ])) as QuestionHistory;
  } catch {
    return empty;
  }
}
function saveQuestionHistory(history: QuestionHistory) {
  try {
    window.sessionStorage.setItem(QUESTION_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // The in-memory deck still prevents repeats if browser storage is unavailable.
  }
}
function shuffle<T,>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}
function makeQuestionDecks(history: QuestionHistory = loadQuestionHistory()): QuestionDecks {
  return Object.fromEntries((Object.keys(questionSets) as Difficulty[]).map(level => {
    const pool = questionSets[level];
    if (pool.length < 48) throw new Error(`La dificultad ${level} necesita 48 preguntas para cubrir una partida completa.`);
    if (new Set(pool.map(question => question.q)).size !== pool.length) throw new Error(`Hay preguntas repetidas en el banco ${level}.`);
    const unasked = pool.filter(question => !history[level].includes(question.q));
    if (unasked.length) return [level, shuffle(unasked)];
    const previousQuestion = history[level][history[level].length - 1];
    const deck = shuffle(pool);
    if (deck.length > 1 && deck[deck.length - 1]?.q === previousQuestion) [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
    history[level] = [];
    return [level, deck];
  })) as QuestionDecks;
}
const difficultyOptions: { id: Difficulty; label: string; hint: string }[] = [
  { id: 'facil', label: 'Fácil', hint: '48 preguntas · al azar y sin repetir' },
  { id: 'intermedia', label: 'Intermedia', hint: '48 preguntas · al azar y sin repetir' },
  { id: 'dificil', label: 'Difícil', hint: '48 preguntas · al azar y sin repetir' },
];
type BlockData = { id: number; level: number; slot: number; cat: number };
const initialBlocks: BlockData[] = Array.from({ length: 18 * 3 }, (_, id) => ({ id, level: Math.floor(id / 3), slot: id % 3, cat: (id * 5 + Math.floor(id / 3) * 3) % categories.length }));

function Wolf({ mood, advice, correct }: { mood: 'hey' | 'good' | 'oops' | 'win'; advice?: string; correct?: boolean }) {
  const lines = { hey: '¡Tu turno! Elige un bloque con calma.', good: '¡Bien jugado! Ahora corona la torre.', oops: '¡Ups! Una más y seguimos con el grupo.', win: '¡La torre cayó! ¿Otra ronda?' };
  return <div className={`wolf-guide ${advice ? 'with-advice' : ''} ${correct ? 'advice-correct' : ''}`}><img className={`wolf-portrait ${mood}`} src="/images/lobit.webp" alt="Lobit, el lobo guía"/><div className="wolf-copy"><small>{advice ? (correct ? 'LOBIT · BUEN CONSEJO' : 'LOBIT · CONSEJO') : 'LOBIT · TU GUÍA'}</small><p>{advice ?? lines[mood]}</p></div></div>;
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
  const questionDecks = useRef<QuestionDecks | null>(null);
  const questionHistory = useRef<QuestionHistory>(loadQuestionHistory());
  const lastQuestion = useRef<string | null>(null);
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

  function drawQuestion(): Question {
    const currentDecks = questionDecks.current ?? (questionDecks.current = makeQuestionDecks(questionHistory.current));
    const deck = currentDecks[difficulty];
    if (deck.length === 0) {
      const history = questionHistory.current[difficulty];
      let refilledPool = questionSets[difficulty].filter(question => !history.includes(question.q));
      if (refilledPool.length === 0) {
        refilledPool = questionSets[difficulty];
        questionHistory.current[difficulty] = [];
      }
      const refilled = shuffle(refilledPool);
      const previousQuestion = lastQuestion.current ?? history[history.length - 1] ?? null;
      if (refilled.length > 1 && refilled[refilled.length - 1]?.q === previousQuestion) {
        [refilled[0], refilled[refilled.length - 1]] = [refilled[refilled.length - 1], refilled[0]];
      }
      deck.push(...refilled);
    }
    const nextQuestion = deck.pop();
    if (!nextQuestion) throw new Error(`No hay preguntas para la dificultad ${difficulty}.`);
    lastQuestion.current = nextQuestion.q;
    questionHistory.current[difficulty].push(nextQuestion.q);
    saveQuestionHistory(questionHistory.current);
    return nextQuestion;
  }

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

  function startGame() { setPhase('pick'); setTowerState('steady'); setLastMessage(`${currentName}, retira una pieza y observa cómo se redistribuye el peso.`); setStarted(true); }
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
      setQuestion(drawQuestion()); setChosen(null); setExtractingId(null); setPhase('question');
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
    {showHowToPlay&&<div className="how-to-backdrop" onClick={()=>setShowHowToPlay(false)}><section className="how-to-dialog" role="dialog" aria-modal="true" aria-labelledby="how-to-title" onClick={event=>event.stopPropagation()}><button className="how-to-close" type="button" aria-label="Cerrar reglas" autoFocus onClick={()=>setShowHowToPlay(false)}><X size={18}/></button><div className="how-to-kicker">JENGABYTE · BUAP</div><h2 id="how-to-title">Una torre, preguntas y buen pulso.</h2><p>JengaByte combina una partida local de Jenga con preguntas de computación. Juegan de 2 a 4 personas por turnos en el mismo equipo. Antes de empezar, elijan una dificultad para ajustar el nivel de las preguntas.</p><ol><li><b>Elige una pieza</b><span>Retira un bloque de cualquier nivel debajo de los tres superiores.</span></li><li><b>Responde el reto</b><span>El tema de la pregunta se elige al azar, sin depender del color de la pieza.</span></li><li><b>Corona la torre</b><span>Si aciertas, coloca la pieza arriba. Si fallas, saca una pieza adicional antes de pasar el turno.</span></li></ol><p className="how-to-ending">Cada dificultad tiene 48 preguntas. Se mezclan al azar y no se repiten en esta pestaña hasta agotar las 48; después se vuelven a mezclar. La partida termina cuando la torre cae. ¡Gana quien logre mantenerla en pie!</p><div className="topic-list" aria-label="Temas de las preguntas">{categories.map(category=><span key={category.name}><i style={{background:category.color}}/>{category.name}</span>)}</div></section></div>}
    {!started ? <section className="welcome"><div className="welcome-copy"><div className="eyebrow"><span>FACULTAD DE CIENCIAS DE LA COMPUTACIÓN</span><span className="eyebrow-line" /></div><h1>Piensa antes<br/>de <em>mover.</em></h1><p>Retira un bloque, responde una pregunta de computación y vuelve a colocarlo arriba. Gana quien mantenga la torre en pie.</p><div className="setup"><div className="setup-title"><span>01</span> JUGADORES <span className="setup-note">HASTA 4 · MISMO ORDENADOR</span></div><div className="player-count">{[2,3,4].map(n=><button key={n} onClick={()=>setPlayerCount(n)} className={playerCount===n?'selected':''}>{n}</button>)}</div><div className="difficulty-control"><span className="difficulty-label">DIFICULTAD DE PREGUNTAS</span><div className="difficulty-picker" role="group" aria-label="Dificultad de las preguntas">{difficultyOptions.map(option=><button type="button" key={option.id} aria-pressed={difficulty===option.id} className={difficulty===option.id?'selected':''} onClick={()=>setDifficulty(option.id)}>{option.label}</button>)}</div><small>{difficultyOptions.find(option=>option.id===difficulty)?.hint}</small></div><div className="name-fields">{Array.from({length:playerCount},(_,i)=><div className="setup-player" key={i}><div className="setup-player-name"><span>{String(i+1).padStart(2,'0')}</span><input aria-label={`Nombre del jugador ${i+1}`} value={names[i]} placeholder={`Jugador ${i+1}`} onChange={e=>setNames(prev=>prev.map((v,j)=>j===i?e.target.value:v))}/><span className="player-preview" role="img" aria-label={`Vista previa: ${playerAvatars[avatarChoices[i]]} en ${['terracota','verde','azul','violeta','ocre'][colorChoices[i]]}`} style={{'--choice-color':playerColors[colorChoices[i]]} as React.CSSProperties}>{playerAvatars[avatarChoices[i]]}</span></div><div className="player-customize"><div className="avatar-picker" role="group" aria-label={`Avatar del jugador ${i+1}`}>{playerAvatars.map((avatar,option)=><button type="button" key={avatar} aria-label={`Avatar ${['lobo','zorro','panda','búho','rana'][option]}${avatarChoices.some((selected,j)=>j!==i&&j<playerCount&&selected===option)?' (ya elegido)':''}`} aria-pressed={avatarChoices[i]===option} disabled={avatarChoices.some((selected,j)=>j!==i&&j<playerCount&&selected===option)} className={avatarChoices[i]===option?'chosen':''} onClick={()=>setAvatarChoices(prev=>prev.map((v,j)=>j===i?option:v))}>{avatar}</button>)}</div><div className="color-picker" role="group" aria-label={`Color del jugador ${i+1}`}>{playerColors.map((color,option)=><button type="button" key={color} aria-label={`Color ${['terracota','verde','azul','violeta','ocre'][option]}${colorChoices.some((selected,j)=>j!==i&&j<playerCount&&selected===option)?' (ya elegido)':''}`} aria-pressed={colorChoices[i]===option} disabled={colorChoices.some((selected,j)=>j!==i&&j<playerCount&&selected===option)} className={colorChoices[i]===option?'chosen':''} style={{'--choice-color':color} as React.CSSProperties} onClick={()=>setColorChoices(prev=>prev.map((v,j)=>j===i?option:v))}/>)}</div></div></div>)}</div><button className="start-button" onClick={startGame}>Empezar partida <ArrowRight size={17}/></button><button type="button" className="how-to-button" onClick={()=>setShowHowToPlay(true)}><CircleHelp size={15}/> Cómo se juega</button></div><div className="welcome-bottom"><BookOpen size={15}/> 8 TEMAS <span>·</span> 48 PREGUNTAS POR DIFICULTAD</div></div><div className="welcome-art"><div className="art-tag">JENGA <span>·</span> RETO DE COMPUTACIÓN</div><div className="welcome-tower" role="img" aria-label="Torre 3D de Jenga con 54 bloques"><WelcomeTower /></div><div className="welcome-mascot"><img src="/images/lobit.webp" alt="Lobit, mascota y guía del juego"/><div><b>LOBIT</b><span>Tu guía de juego</span></div></div><div className="tower-piece-count"><b>54</b><span>PIEZAS<br/>EN JUEGO</span></div></div></section> : <>
      <div className="game-heading"><div><div className="eyebrow"><span>FACULTAD DE CIENCIAS DE LA COMPUTACIÓN</span><span className="eyebrow-line"/></div><h1>Jenga<em>Byte.</em></h1></div><div className="round-info"><span>RONDA</span><b>{String(Math.floor(removed.length / playerCount) + 1).padStart(2,'0')}</b><button className="menu-button" onClick={()=>setShowExitConfirm(true)} title="Volver al menú principal"><ArrowLeft size={14}/> MENÚ</button><button onClick={reset} title="Reiniciar partida"><RotateCcw size={15}/> REINICIAR</button></div></div>
      <section className="game-layout"><aside className="left-rail"><div className="rail-label">EN LA MESA <span>0{playerCount}</span></div><div className="players">{score.map((p,i)=><div className={`player ${p.active?'active':''}`} key={i}><span className="player-avatar" style={{'--player':p.color} as React.CSSProperties} aria-label={`Avatar de ${p.name}`}>{p.avatar}</span><span className="player-name">{p.name || `Jugador ${i+1}`}</span>{p.active&&<span className="turn-mark">JUEGA</span>}<b>{removed.filter((_,j)=>j%playerCount===i).length}</b></div>)}</div><div className="rail-divider"/><div className="rail-label">CATEGORÍAS <CircleHelp size={14}/></div><div className="category-list">{categories.map(c=><div key={c.name}><i style={{background:c.color}}/>{c.name}</div>)}</div><div className="small-tip"><span>↗</span> Gira la vista arrastrando el mouse.</div></aside>
        <div className="stage"><div className="stage-top"><span><i/> {phase==='pick'?'TU TURNO: HAZ CLIC EN UNA PIEZA':phase==='extracting'?'SACANDO LA PIEZA…':phase==='over'?'FIN DE LA PARTIDA':'RESPONDE LA PREGUNTA'}</span><button aria-expanded={showRules} onClick={()=>setShowRules(v=>!v)}>CÓMO JUGAR <ChevronDown size={14}/></button></div>{showRules&&<div className="rules-popover"><b>Tu turno en 3 pasos</b><span>1. Saca una pieza con un clic.</span><span>2. Responde la pregunta aleatoria.</span><span>3. Si aciertas, colócala arriba. Si fallas, saca una más.</span></div>}<div className="tower-stage-row"><div className={`tower-status vertical ${towerState}`}><div className="status-head"><span>ESTABILIDAD</span><b>{towerState==='fallen'?'CAÍDA':towerState==='moving'?'RIESGO':'ESTABLE'}</b></div><small className="stability-percent">{stabilityValue}%</small><div className="vertical-meter" role="meter" aria-label="Estabilidad de la torre" aria-valuemin={0} aria-valuemax={100} aria-valuenow={stabilityValue} aria-valuetext={`${stabilityValue}% de estabilidad`}><i style={{height:`${stabilityValue}%`}}/></div><div className="vertical-count"><b>{blocks.length-removed.length}</b><span>PIEZAS<br/>EN TORRE</span></div><small className="vertical-initial">54 INICIALES</small></div><div className="canvas-wrap"><Tower key={gameVersion} blocks={blocks} removed={removed} extractingId={extractingId} physicsActive={physicsActive} falling={falling} onPick={pickBlock} onTipping={onTipping} onCollapse={beginCollapse}/>{phase==='over'&&showFallOverlay&&<div className="fall-overlay"><span>FIN DE PARTIDA</span><h2>La torre <em>cayó.</em></h2><p>{currentName} hizo el último movimiento.</p><button onClick={reset}>Jugar otra vez <RotateCcw size={16}/></button></div>}</div></div><div className="stage-caption"><span><b>1</b> CLIC: SACA UNA PIEZA</span><span><b>2</b> RESPONDE SU PREGUNTA</span><span><b>3</b> ACIERTA: COLOCA ARRIBA · FALLA: SACA OTRA</span></div></div>
        <aside className="right-rail"><div className="turn-card"><div className="turn-kicker"><span className="live-dot"/> TURNO ACTUAL</div><h2>{currentName}<span>.</span></h2><p className="turn-message">{lastMessage}</p><Wolf mood={mood} advice={phase==='feedback'?question?.explain:undefined} correct={chosen===question?.answer}/></div>{(phase==='question'||phase==='feedback')&&question&&<div className={`question-card ${phase==='feedback'?'answered':''}`}>
          <div className="question-meta"><span style={{background:'#6387ae'}}/>RETO ALEATORIO<b>{phase==='feedback'?'REVISA TU RESPUESTA':'ELIGE UNA RESPUESTA'}</b></div><h3>{question.q}</h3>
          <div className="answers">{options.map((option,i)=><button key={i} onClick={()=>answer(i)} disabled={chosen!==null} className={phase==='feedback'&&i===question.answer?'correct':phase==='feedback'&&i===chosen?'incorrect':''}><span className="answer-letter">{String.fromCharCode(65+i)}</span><span className="answer-text">{option}</span>{phase==='feedback'&&i===question.answer&&<span className="answer-badge">✓ Correcta</span>}{phase==='feedback'&&i===chosen&&i!==question.answer&&<span className="answer-badge wrong">✕ Incorrecta</span>}</button>)}</div>
          {phase==='feedback'&&<button className="continue-button" onClick={advance}>{chosen===question.answer?`Colocar ${pulledThisTurn.length} ${pulledThisTurn.length===1?'bloque':'bloques'} y pasar turno`:!wrongPull?'Retirar otro bloque':'Colocar bloques y pasar turno'} <ArrowRight size={16}/></button>}
        </div>}{phase==='extracting'&&<div className="instruction-card extracting-card"><div className="instruction-number">↔</div><div><b>Sacando el bloque</b><p>Espera un momento; observa si la torre se mueve.</p></div></div>}{phase==='pick'&&<div className="instruction-card"><div className="instruction-number">{wrongPull?'!':'01'}</div><div><b>{wrongPull?'Una pieza más':'Elige un bloque'}</b><p>{wrongPull?'Retira un bloque para cerrar este turno.':'Toca cualquier bloque de los niveles inferiores.'}</p></div></div>}</aside>
      </section><footer className="game-footer"><span>JENGABYTE BUAP <i>·</i> RETO DE LOBIT</span><span>UNA PARTIDA LOCAL <i>·</i> SIN CONEXIÓN</span></footer></>}
  </main>;
}
