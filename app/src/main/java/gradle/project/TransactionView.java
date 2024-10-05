package gradle.project;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionView {
    private Long id;
    private String fromAccountName;
    private String toAccountName;
    private BigDecimal amount;
    private LocalDateTime date;

    public TransactionView(Long id, String fromAccountName, String toAccountName, BigDecimal amount,
            LocalDateTime date) {
        this.id = id;
        this.fromAccountName = fromAccountName;
        this.toAccountName = toAccountName;
        this.amount = amount;
        this.date = date;
    }

    public Long getId() {
        return id;
    }

    public String getFromAccountName() {
        return fromAccountName;
    }

    public String getToAccountName() {
        return toAccountName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDateTime getDate() {
        return date;
    }
}