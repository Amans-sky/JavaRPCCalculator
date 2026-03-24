package backend.server;

public class CalculatorService {
    public double calculate(String operation, Double a, Double b) throws Exception {
        switch (operation.toLowerCase()) {
            case "add": return a + b;
            case "subtract": return a - b;
            case "multiply": return a * b;
            case "divide":
                if (b == 0) throw new ArithmeticException("Divide by zero");
                return a / b;
            case "modulus": return a % b;
            case "power": return Math.pow(a, b);
            case "sqrt": return Math.sqrt(a);
            case "cbrt": return Math.cbrt(a);
            case "factorial": return factorial(a.intValue());
            case "log": return Math.log10(a);
            case "ln": return Math.log(a);
            case "sin": return Math.sin(Math.toRadians(a));
            case "cos": return Math.cos(Math.toRadians(a));
            case "tan": return Math.tan(Math.toRadians(a));
            case "asin": return Math.toDegrees(Math.asin(a));
            case "acos": return Math.toDegrees(Math.acos(a));
            case "atan": return Math.toDegrees(Math.atan(a));
            default: throw new UnsupportedOperationException("Unknown operation: " + operation);
        }
    }

    private double factorial(int n) {
        if (n < 0) throw new IllegalArgumentException("Factorial of negative number");
        double result = 1;
        for (int i = 2; i <= n; i++) result *= i;
        return result;
    }
}
