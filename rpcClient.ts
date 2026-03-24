import net from 'net';

const PORT = 5000;
const HOST = '127.0.0.1';

const callRPC = (operation: string, a: number = 0, b: number = 0, extra: any = null): Promise<number> => {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        client.connect(PORT, HOST, () => {
            client.write(JSON.stringify({ operation, a, b, extra }));
        });

        client.on('data', (data) => {
            const response = JSON.parse(data.toString());
            client.destroy();
            if (response.error) {
                reject(response.error);
            } else {
                resolve(response.result);
            }
        });

        client.on('error', (err) => {
            reject(`RPC Client Error: ${err.message}`);
        });
    });
};

export default callRPC;
