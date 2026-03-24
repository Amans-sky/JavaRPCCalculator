package backend.common;

import java.io.Serializable;

public class Request implements Serializable {
    private static final long serialVersionUID = 1L;
    private String operation;
    private Double a;
    private Double b;

    public Request(String operation, Double a, Double b) {
        this.operation = operation;
        this.a = a;
        this.b = b;
    }

    public String getOperation() { return operation; }
    public Double getA() { return a; }
    public Double getB() { return b; }
}
