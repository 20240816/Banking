package gradle.project;

import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/")
public class HomeController {

    @GetMapping("/")
    public String index() throws IOException {
        Resource resource = new ClassPathResource("static/index.html");
        Path indexPath = resource.getFile().toPath();
        return Files.readString(indexPath, StandardCharsets.UTF_8);
    }

}