package backend.server;

import backend.common.Request;
import backend.common.Response;
import java.io.*;
import java.net.Socket;

public class ClientHandler implements Runnable {
    private Socket socket;
    private CalculatorService calculatorService;

    public ClientHandler(Socket socket) {
        this.socket = socket;
        this.calculatorService = new CalculatorService();
    }

    @Override
    public void run() {
        try (
            ObjectInputStream in = new ObjectInputStream(socket.getInputStream());
            ObjectOutputStream out = new ObjectOutputStream(socket.getOutputStream())
        ) {
            Request request = (Request) in.readObject();
            try {
                double result = calculatorService.calculate(request.getOperation(), request.getA(), request.getB());
                out.writeObject(new Response(result));
            } catch (Exception e) {
                out.writeObject(new Response(e.getMessage()));
            }
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
        } finally {
            try {
                socket.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
