package backend.client;

import backend.common.Request;
import backend.common.Response;
import java.io.*;
import java.net.Socket;

public class RPCClient {
    private static final String HOST = "localhost";
    private static final int PORT = 5000;

    public static void main(String[] args) {
        if (args.length < 1) {
            System.err.println("Usage: java RPCClient <operation> [a] [b]");
            System.exit(1);
        }

        String operation = args[0];
        Double a = (args.length > 1) ? Double.parseDouble(args[1]) : 0.0;
        Double b = (args.length > 2) ? Double.parseDouble(args[2]) : 0.0;

        try (
            Socket socket = new Socket(HOST, PORT);
            ObjectOutputStream out = new ObjectOutputStream(socket.getOutputStream());
            ObjectInputStream in = new ObjectInputStream(socket.getInputStream())
        ) {
            out.writeObject(new Request(operation, a, b));
            Response response = (Response) in.readObject();
            if (response.getError() != null) {
                System.out.println("ERROR: " + response.getError());
            } else {
                System.out.println(response.getResult());
            }
        } catch (IOException | ClassNotFoundException e) {
            System.out.println("ERROR: " + e.getMessage());
        }
    }
}
