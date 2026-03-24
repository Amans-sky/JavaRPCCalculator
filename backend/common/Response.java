package backend.common;

import java.io.Serializable;

public class Response implements Serializable {
    private static final long serialVersionUID = 1L;
    private Double result;
    private String error;

    public Response(Double result) {
        this.result = result;
        this.error = null;
    }

    public Response(String error) {
        this.result = null;
        this.error = error;
    }

    public Double getResult() { return result; }
    public String getError() { return error; }
}
