import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import * as math from 'mathjs';
import callRPC from './rpcClient.ts';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Endpoint for direct operations
app.post('/api/calculate', async (req, res) => {
    const { operation, a, b } = req.body;
    try {
        const result = await callRPC(operation, a, b);
        res.json({ result });
    } catch (error) {
        res.status(400).json({ error });
    }
});

// Endpoint for geometry
app.post('/api/geometry', async (req, res) => {
    const { operation, a, b } = req.body;
    try {
        const result = await callRPC(operation, a, b);
        res.json({ result });
    } catch (error) {
        res.status(400).json({ error });
    }
});

// Endpoint for conversions
app.post('/api/convert', async (req, res) => {
    const { operation, value, from, to } = req.body;
    try {
        const result = await callRPC(operation, value, 0, { from, to });
        res.json({ result });
    } catch (error) {
        res.status(400).json({ error });
    }
});

// Endpoint for full expressions
app.post('/api/evaluate', async (req, res) => {
    const { expression } = req.body;
    try {
        // Parse the expression using mathjs
        const node = math.parse(expression);
        
        // Recursively evaluate the node using RPC for math operations
        const evaluateNode = async (n: any): Promise<number> => {
            if (n.type === 'ConstantNode') {
                return n.value;
            }
            if (n.type === 'OperatorNode') {
                const args = await Promise.all(n.args.map((arg: any) => evaluateNode(arg)));
                let op = '';
                switch (n.op) {
                    case '+': op = 'add'; break;
                    case '-': op = 'subtract'; break;
                    case '*': op = 'multiply'; break;
                    case '/': op = 'divide'; break;
                    case '^': op = 'power'; break;
                    case '%': op = 'modulus'; break;
                    default: throw new Error(`Unsupported operator: ${n.op}`);
                }
                return await callRPC(op, args[0], args[1]);
            }
            if (n.type === 'FunctionNode') {
                const args = await Promise.all(n.args.map((arg: any) => evaluateNode(arg)));
                const funcName = n.name.toLowerCase();
                // Check if it's a supported RPC function
                const supportedFuncs = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sqrt', 'cbrt', 'log', 'ln', 'factorial'];
                if (supportedFuncs.includes(funcName)) {
                    return await callRPC(funcName, args[0], args[1] || 0);
                }
                throw new Error(`Unsupported function: ${funcName}`);
            }
            if (n.type === 'ParenthesisNode') {
                return await evaluateNode(n.content);
            }
            throw new Error(`Unsupported node type: ${n.type}`);
        };

        const result = await evaluateNode(node);
        res.json({ result });
    } catch (error: any) {
        res.status(400).json({ error: error.message || error });
    }
});

async function startServer() {
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Bridge API & Frontend running on http://localhost:${PORT}`);
    });
}

startServer();
