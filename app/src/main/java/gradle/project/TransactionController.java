package gradle.project;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class TransactionController {

        private final TransactionRepository transactionRepository;
        private final AccountRepository accountRepository;

        @Autowired
        public TransactionController(TransactionRepository transactionRepository,
                        AccountRepository accountRepository) {
                this.transactionRepository = transactionRepository;
                this.accountRepository = accountRepository;
        }

        @GetMapping("/transactions")
        public ResponseEntity<List<TransactionView>> getAllTransactions(@RequestParam(required = false) Long account) {
                List<Transaction> transactions = transactionRepository.findAll();
                if (account != null) transactions = transactions.stream()
                        .filter(transaction -> transaction.getFromAccount().equals(account) || transaction.getToAccount().equals(account))
                        .collect(Collectors.toList());
                List<TransactionView> response = transactions.stream()
                                .map(transaction -> {
                                        String fromAccountName = accountRepository
                                                        .findById(transaction.getFromAccount())
                                                        .map(Account::getName)
                                                        .orElse("Unknown");
                                        String toAccountName = accountRepository.findById(transaction.getToAccount())
                                                        .map(Account::getName)
                                                        .orElse("Unknown");

                                        return new TransactionView(transaction.getId(), fromAccountName, toAccountName,
                                                        transaction.getAmount(), transaction.getDate());
                                })
                                .collect(Collectors.toList());

                return ResponseEntity.ok(response);
        }
}