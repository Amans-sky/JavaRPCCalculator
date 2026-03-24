import net from 'net';

const PORT = 5000;

const calculate = (operation: string, a: number, b: number, extra?: any): number => {
    switch (operation.toLowerCase()) {
        case 'add': return a + b;
        case 'subtract': return a - b;
        case 'multiply': return a * b;
        case 'divide':
            if (b === 0) throw new Error('Divide by zero');
            return a / b;
        case 'modulus': return a % b;
        case 'power': return Math.pow(a, b);
        case 'sqrt': return Math.sqrt(a);
        case 'cbrt': return Math.cbrt(a);
        case 'factorial':
            if (a < 0) throw new Error('Factorial of negative number');
            let res = 1;
            for (let i = 2; i <= a; i++) res *= i;
            return res;
        case 'log': return Math.log10(a);
        case 'ln': return Math.log(a);
        case 'sin': return Math.sin(a * Math.PI / 180);
        case 'cos': return Math.cos(a * Math.PI / 180);
        case 'tan': return Math.tan(a * Math.PI / 180);
        case 'asin': return Math.asin(a) * 180 / Math.PI;
        case 'acos': return Math.acos(a) * 180 / Math.PI;
        case 'atan': return Math.atan(a) * 180 / Math.PI;
        
        // Geometry
        case 'arearectangle': return a * b;
        case 'areacircle': return Math.PI * Math.pow(a, 2);
        case 'areatriangle': return 0.5 * a * b;
        case 'volumecube': return Math.pow(a, 3);
        case 'volumesphere': return (4/3) * Math.PI * Math.pow(a, 3);
        case 'volumecylinder': return Math.PI * Math.pow(a, 2) * b;
        case 'perimeterrectangle': return 2 * (a + b);
        case 'circumference': return 2 * Math.PI * a;

        // Conversions
        case 'convertlength': {
            const { from, to } = extra;
            const rates: any = { meters: 1, cm: 0.01, km: 1000 };
            return (a * rates[from]) / rates[to];
        }
        case 'convertweight': {
            const { from, to } = extra;
            const rates: any = { kg: 1, grams: 0.001, pounds: 0.453592 };
            return (a * rates[from]) / rates[to];
        }
        case 'converttemperature': {
            const { from, to } = extra;
            let celsius = a;
            if (from === 'fahrenheit') celsius = (a - 32) * 5/9;
            if (from === 'kelvin') celsius = a - 273.15;
            
            if (to === 'celsius') return celsius;
            if (to === 'fahrenheit') return (celsius * 9/5) + 32;
            if (to === 'kelvin') return celsius + 273.15;
            return celsius;
        }

        default: throw new Error(`Unknown operation: ${operation}`);
    }
};

const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        try {
            const { operation, a, b, extra } = JSON.parse(data.toString());
            const result = calculate(operation, a, b, extra);
            socket.write(JSON.stringify({ result }));
        } catch (error: any) {
            socket.write(JSON.stringify({ error: error.message }));
        }
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`RPC Server (Node.js) listening on port ${PORT}`);
});
