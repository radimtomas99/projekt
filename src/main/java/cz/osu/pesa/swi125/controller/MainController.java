package cz.osu.pesa.swi125.controller;

import cz.osu.pesa.swi125.model.entity.AppUser;
import cz.osu.pesa.swi125.model.entity.Role;
import cz.osu.pesa.swi125.model.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;

@RestController
public class MainController {
    @Value("${app.name}")
    private String appName;
    private final AppUserRepository userRepo;

    public MainController(AppUserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping("/register")
    public String register(@RequestParam String username, @RequestParam String password) {
        AppUser newUser = new AppUser();
        newUser.setUsername(username);
        newUser.setPassword(password);
        newUser.setRole(Role.ADMIN);
        //AppUser newUser = new AppUser(username, password, Role.ADMIN);

        userRepo.save(newUser);

        return "User registered successfully";
    }

    @GetMapping("/users")
    public String getUsers() {
        for (AppUser u : userRepo.findAll()) {
            System.out.println(u);
            System.out.println("--------------");
            System.out.println(u.toString());
        }
        System.out.println("------------");
        return userRepo.findAll().toString();
    }

    // localhost:8081/age?date=2000-01-01
    @GetMapping("/age")
    public int getAge(@RequestParam("date") String date) {
        String datePattern = "yyyy-MM-dd";
        SimpleDateFormat sdf = new SimpleDateFormat(datePattern);
        int age;

        try {
            age = Period.between(sdf.parse(date).toInstant()
                            .atZone(ZoneId.systemDefault()).toLocalDate(),
                    LocalDate.now()).getYears();
        } catch (ParseException e) {
            age = -1;
        }
        return age;
    }

    // localhost:8081/name?value=Radim
    @GetMapping(value = "/name")
    public String getName(@RequestParam("value") String name) {
        return "Inserted name is: " + name;
    }

    // localhost:8081/appName
    @GetMapping(value = "/appName")
    public String getAppName() {
        return appName;
    }
}
