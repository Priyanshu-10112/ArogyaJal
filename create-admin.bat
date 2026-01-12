@echo off
echo Creating admin user for ArogyaJal system...

curl -X POST "http://localhost:8080/api/users/register-official" ^
-H "Content-Type: application/json" ^
-d "{\"role\":\"STATE_ADMIN\",\"fullName\":\"System Administrator\",\"phoneNumber\":\"9999999999\",\"email\":\"admin@arogyajal.gov.in\",\"password\":\"admin123\",\"state\":\"Assam\",\"district\":\"Kamrup\",\"designation\":\"State Administrator\",\"employeeId\":\"ADMIN001\"}"

echo.
echo Admin user created with:
echo Email: admin@arogyajal.gov.in
echo Password: admin123
echo Role: STATE_ADMIN
echo.
pause