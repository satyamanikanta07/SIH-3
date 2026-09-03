@echo off
title NER Logistics - MongoDB Database Seeder
color 0B

echo =====================================================================
echo    NER Logistics - Database Seeding and Setup
echo =====================================================================
echo.
echo Seeding MongoDB with realistic regional logistics data:
echo   - 4 Role Accounts (Admin, Govt Official, Field Officer, Driver)
echo   - 12 NER Districts (Assam, Meghalaya, Manipur, Mizoram, Nagaland, Sikkim, Tripura)
echo   - 14 Strategic Highways and Roads
echo   - 8 Corridors & AI Alternate Route Bypasses
echo   - 10 Fleet Vehicles (Assigned drivers, live telemetry)
echo   - 8 Incident Records (Landslides, floods, washouts)
echo   - 12 Logistics Delivery Consignments
echo   - 10 Multi-Agency Emergency Alerts
echo   - 12 District Weather Records
echo   - 3 Offline-Compatible Field Reports
echo.
echo Make sure MongoDB is active on mongodb://localhost:27017
echo.
pause

cd /d %~dp0backend
node seed/seedData.js

echo.
echo =====================================================================
echo  Database Seeding Completed!
echo =====================================================================
echo.
pause
