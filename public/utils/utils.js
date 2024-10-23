class TypeofData {
    // Verificar si el valor es un objeto
    static isObject(value) {
      return value !== null && typeof value === 'object';
    }
    static ObjectStringify(value) {
      if (typeof value === 'string') {
        try {
          // Intenta analizar la cadena como JSON
          JSON.parse(value);
          // Si no hay error, asumimos que ya es una cadena JSON válida
        } catch (e) {
          // Si no es JSON válido, lo convertimos a JSON
          value = JSON.stringify(value);
        }
      } else if (typeof value === 'object') {
        // Si es un objeto, lo convertimos a JSON
        value = JSON.stringify(value);
      }
      return value;
    }
    static returnArray(value) {
      if (this.isArray(value)) {
        return value;
      } else if (this.isString(value)) {
        return value.split(',');
      } else if (this.isObject(value)) {
        return Object.values(value);
      }
      return [];
    }
    // Verificar si el valor es un array
    static isArray(value) {
      return Array.isArray(value);
    }
  
    // Verificar si el valor es una función
    static isFunction(value) {
      return typeof value === 'function';
    }
  
    // Verificar si el valor es una string
    static isString(value) {
      return typeof value === 'string';
    }
  
    // Verificar si el valor es un número
    static isNumber(value) {
      return typeof value === 'number' && !isNaN(value);
    }
  
    // Verificar si el valor es un booleano
    static isBoolean(value) {
      return typeof value === 'boolean';
    }
  
    // Verificar si el valor es null
    static isNull(value) {
      return value === null;
    }
  
    // Verificar si el valor es undefined
    static isUndefined(value) {
      return value === undefined;
    }
  
    // Convertir string a número
    static toNumber(value) {
      if (this.isString(value) && !isNaN(value)) {
        return Number(value);
      } else if (this.isNumber(value)) {
        return value;
      }
      return null; // Devolver NaN si la conversión falla
    }
  
    // Convertir número a string
    static toString(value) {
      if (this.isNumber(value)) {
        return String(value);
      }
      if (this.isBoolean(value)) {
        return String(value);
      }
      if (this.isObject(value)) {
        return JSON.stringify(value);
      }
      return '';
    }
    static toStringParse(value) {
      if (!value) return value; // Devuelve el valor original si no es una cadena
      if (this.isString(value)) {
        try {
          return JSON.parse(value);
        } catch (error) {
          console.warn("Failed to parse JSON string:", value);
          return value; // Devuelve el valor original si no se puede analizar
        }
      }
      return value; // Devuelve el valor original si no es una cadena
    }
    // Verificar si un string puede ser convertido a número
    static canBeNumber(value) {
      return this.isString(value) && !isNaN(value);
    }
  
    // Obtener el tipo del valor en forma de string
    static getType(value) {
      if (this.isObject(value)) return 'object';
      if (this.isArray(value)) return 'array';
      if (this.isFunction(value)) return 'function';
      if (this.isString(value)) return 'string';
      if (this.isNumber(value)) return 'number';
      if (this.isBoolean(value)) return 'boolean';
      if (this.isNull(value)) return 'null';
      if (this.isUndefined(value)) return 'undefined';
      return 'unknown';
    }
}
  
// Ejemplo de usoquerySnapshot.forEach
// console.log(TypeofData.isString("hello")); // true
// console.log(TypeofData.isNumber(123)); // true
// console.log(TypeofData.isArray([1, 2, 3])); // true
// console.log(TypeofData.toNumber("123")); // 123
// console.log(TypeofData.toString(123)); // "123"
// console.log(TypeofData.getType({})); // "object"
// console.log(TypeofData.canBeNumber("456")); // true
class Counter {
    constructor(initialValue = 0, interval = 1000) {
      this.value = initialValue;
      this.interval = interval;
      this.intervalId = null;
    }
  
    start() {
      if (!this.intervalId) {
        this.intervalId = setInterval(() => {
          this.increment();
          // console.log(`ID generado: ${this.value}`);
        }, this.interval);
      }
    }
  
    stop() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  
    increment() {
      this.value++;
      return this.value;
    }
  
    getCurrentValue() {
      return this.value;
    }
}
class ComboTracker {
  constructor(resetInterval = 30000) {
    this.comboCounters = {}; // Almacena los contadores por tipo y uniqueId
    this.resetInterval = resetInterval; // Intervalo en milisegundos para reiniciar los contadores

    // Iniciar el temporizador para restablecer los contadores
    this.startResetTimer();
  }

  // Método general para manejar combos entrantes (like, comment, etc.) y retornar el total acumulado
  addCombo(data, comboType = 'likeCount') {
    const { uniqueId, value } = data;

    if (!this.comboCounters[uniqueId]) {
      // Inicializar el contador para este uniqueId
      this.comboCounters[uniqueId] = {};
    }

    if (!this.comboCounters[uniqueId][comboType]) {
      // Inicializar el contador para este comboType si no existe
      this.comboCounters[uniqueId][comboType] = 0;
    }

    // Sumar el valor al contador correspondiente
    this.comboCounters[uniqueId][comboType] += value;

    // Retornar el total acumulado de combos para este uniqueId y comboType
    return this.comboCounters[uniqueId][comboType];
  }

  // Método para obtener el total de todos los combos de todos los tipos
  getTotalCombos() {
    let total = 0;
    Object.values(this.comboCounters).forEach(userCombos => {
      Object.values(userCombos).forEach(count => {
        total += count;
      });
    });
    return total;
  }

  // Método para restablecer los contadores de todos los tipos
  resetComboCounters() {
    Object.keys(this.comboCounters).forEach(uniqueId => {
      Object.keys(this.comboCounters[uniqueId]).forEach(comboType => {
        this.comboCounters[uniqueId][comboType] = 0; // Reinicia el contador para cada tipo
      });
    });
  }

  // Iniciar el temporizador que restablece los contadores periódicamente
  startResetTimer() {
    setInterval(() => {
      this.resetComboCounters();
      // console.log("Los contadores de combos han sido restablecidos.");
    }, this.resetInterval);
  }
}
class LikeTracker {
  constructor(resetInterval = 30000) { // Intervalo de reinicio por defecto: 30 segundos
    this.likeCounters = {}; // Almacena los contadores de likes por uniqueId
    this.resetInterval = resetInterval; // Intervalo en milisegundos para reiniciar los contadores

    // Iniciar el temporizador para restablecer los contadores
    this.startResetTimer();
  }

  // Método para manejar likes entrantes y retornar el total acumulado
  addLike(data) {
    const { uniqueId, likeCount } = data;

    if (!this.likeCounters[uniqueId]) {
      // Inicializar el contador en 0 si no existe
      this.likeCounters[uniqueId] = 0;
    }

    // Sumar los nuevos likes al contador existente
    this.likeCounters[uniqueId] += likeCount;

    // Retornar el total acumulado de likes para este usuario
    return this.likeCounters[uniqueId];
  }

  // Método para restablecer los contadores de likes
  resetLikeCounters() {
    Object.keys(this.likeCounters).forEach(uniqueId => {
      this.likeCounters[uniqueId] = 0; // Reinicia el contador para cada usuario
    });
  }

  // Iniciar el temporizador que restablece los contadores periódicamente
  startResetTimer() {
    setInterval(() => {
      this.resetLikeCounters();
      // console.log("Los contadores de likes han sido restablecidos.");
    }, this.resetInterval);
  }
}
const EvaluerLikes = new LikeTracker(5000);
const replaceVariables = (command, data, iscommand = false ) => {
  let playerName = localStorage.getItem('playerNameInput') || localStorage.getItem('playerName');

  if (typeof command !== 'string') {
    console.warn("Error: 'command' debe ser una cadena de texto.", typeof command);
    return command; // O lanzar un error si prefieres: throw new Error("'command' debe ser una cadena de texto.");
  }
  if (!command) {
    return command;
  }
  if (iscommand && command.includes(" ")) {
    // Dividimos el string en máximo 2 partes usando el espacio como separador
    command = command.split(" ", 2)[1];
  }
  // Reemplazar variables en el comando
  let replacedCommand = command
    .replace(/uniqueId/g, data.uniqueId || 'testUser')
    .replace(/uniqueid/g, data.uniqueId || 'testUser')
    .replace(/nickname/g, data.nickname || 'testUser')
    .replace(/comment/g, data.comment || 'testComment')
    .replace(/{milestoneLikes}/g, EvaluerLikes.addLike(data) || '50testLikes')
    .replace(/{likes}/g, EvaluerLikes.addLike(data) || '50testLikes')
    .replace(/message/g, data.comment || 'testcomment')
    .replace(/giftName/g, data.giftName || 'testgiftName')
    .replace(/giftname/g, data.giftName || 'testgiftName')
    .replace(/repeatCount/g, data.repeatCount || '123')
    .replace(/repeatcount/g, data.repeatCount || '123')
    .replace(/playername/g, playerName || '@a') // Reemplazar el nombre del jugador
    .replace(/diamonds/g, data.diamondCount || '50testDiamonds')
    .replace(/likecount/g, EvaluerLikes.addLike(data) || '50testLikes')
    .replace(/followRole/g, data.followRole || 'followRole 0')
    .replace(/userId/g, data.userId || '1235646')
    .replace(/teamMemberLevel/g, data.teamMemberLevel || 'teamMemberLevel 0')
    .replace(/subMonth/g, data.subMonth || 'subMonth 0');

  // Eliminar todos los backslashes
  replacedCommand = replacedCommand.replace(/\\/g, '');

  return replacedCommand;
};

class ObjectComparator {
  constructor(mainObject) {
    this.mainObject = mainObject;
  }

  // Ahora devuelve todos los tipos de comparación para cada clave
  compareKeys(objectsToCompare, keysToCheck) {
    if (Array.isArray(objectsToCompare)) {
      // Si es un array, procesamos todos los objetos
      return objectsToCompare.map(obj => {
        return this.compareSingleObject(obj, keysToCheck);
      });
    } else {
      // Si es un solo objeto, simplemente lo procesamos
      return this.compareSingleObject(objectsToCompare, keysToCheck);
    }
  }

  compareSingleObject(obj, keysToCheck) {
    const result = {};
    keysToCheck.forEach(key => {
      const keyName = typeof key === 'object' ? key.key : key;
      const compareType =
        typeof key === 'object' && key.compare ? key.compare : 'isEqual';
      result[keyName] = this.compareValues(
        this.mainObject[keyName],
        obj[keyName]
      );
    });
    return result;
  }

  compareValues(value1, value2) {
    if (typeof value1 === 'string' && typeof value2 === 'string') {
      return this.compareStrings(value1, value2);
    } else if (typeof value1 === 'number' && typeof value2 === 'number') {
      return this.compareNumbers(value1, value2);
    } else {
      return { isEqual: value1 === value2 };
    }
  }

  compareStrings(str1, str2) {
    return {
      isEqual: str1 === str2,
      contains: str1.includes(str2),
      startsWith: str1.startsWith(str2),
      endsWith: str1.endsWith(str2),
    };
  }

  compareNumbers(num1, num2) {
    const maxRange2 = num2 * 1.1; // 110% del valor de num2
    const minRange2 = num2 * 0.9; // 90% del valor de num2
    return {
      isEqual: num1 === num2,
      isLess: num1 < num2,
      isGreater: num1 > num2,
      isLessOrEqual: num1 <= num2,
      isGreaterOrEqual: num1 >= num2,
      isInRange: num1 >= minRange2 && num1 <= maxRange2,
    };
  }
}

function compareObjects(mainObject, objectsToCompare, keysToCheck, callback) {
  const comparator = new ObjectComparator(mainObject);
  const comparisonResults = comparator.compareKeys(
    objectsToCompare,
    keysToCheck
  );
  const validResults = [];
  let coincidentobjects = {};
  // Ejecutar el callback si se proporciona
  if (callback && typeof callback === 'function') {
    comparisonResults.forEach((comparisonResult, index) => {
      const allComparisonsTrue = getComparisonValues(
        comparisonResult,
        keysToCheck
      );
      
      if (allComparisonsTrue.allTrue) {
        callback(objectsToCompare[index], index,allComparisonsTrue);
        validResults.push(objectsToCompare[index]);
        coincidentobjects = allComparisonsTrue;
      }
    });
  }

  return { comparisonResults, validResults, coincidentobjects }; // Retornar solo los objetos válidos
}
function getComparisonValues(obj, keysToCheck) {
  const result = {};
  let allTrue = true; // Variable para rastrear si todos son true

  keysToCheck.forEach(({ key, compare }) => {
    if (obj[key] && obj[key][compare] !== undefined) {
      result[key] = obj[key][compare];
      // Si alguno de los valores no es true, establecer allTrue en false
      if (!obj[key][compare]) {
        allTrue = false;
      }
    }
  });

  // Añadir el resultado de la verificación allTrue
  result.allTrue = allTrue;

  return result;
}
// Crear múltiples contadores con diferentes intervalos
// const counter1 = new Counter(0, 1000); // Genera ID cada 1 segundo
// // Usar los IDs generados
// setInterval(() => {
//   const id1 = counter1.increment();
//   console.log(id1);
// }, 3000);
/* const tracker = new ComboTracker();

// Agregamos likes y comentarios para 'user1' y 'user2'
tracker.addCombo({ uniqueId: 'user1', value: 5 }, 'likeCount'); // 5 likes
tracker.addCombo({ uniqueId: 'user1', value: 2 }, 'commentCount'); // 2 comentarios

tracker.addCombo({ uniqueId: 'user2', value: 4 }, 'likeCount'); // 4 likes para 'user2'
tracker.addCombo({ uniqueId: 'user2', value: 1 }, 'commentCount'); // 1 comentario para 'user2'

// Verificamos los contadores
console.log(tracker.comboCounters); 
// {
//   user1: { likeCount: 5, commentCount: 2 },
//   user2: { likeCount: 4, commentCount: 1 }
// }

// Total acumulado de todos los combos (likes + comentarios)
console.log('Total de combos acumulados:', tracker.getTotalCombos()); // 12 */
export { Counter, TypeofData,ComboTracker, replaceVariables, compareObjects };
  