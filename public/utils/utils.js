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
export { Counter, TypeofData,ComboTracker };
  