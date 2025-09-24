package com.arogyajal;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "firebase.project-id=test-project",
    "firebase.credentials.path=",
    "firebase.database-url=https://test-project.firebaseio.com"
})
class ArogyajalBackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
