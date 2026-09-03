@echo off
title NER Logistics - Automated RBAC and Functionality Test Suite
color 0E

echo =====================================================================
echo    NER Logistics - Automated RBAC and Security Test Suite
echo =====================================================================
echo.
echo Running 36-point security matrix across 4 roles:
echo   - Test 1: Road Status Modification (Admin/Govt allowed, Driver/Field 403)
echo   - Test 2: Delivery CRUD and Scoping (Admin allowed, Others 403)
echo   - Test 3: Emergency Alert Broadcast (Admin allowed, Others 403)
echo   - Test 4: Incident Lifecycle and Resolution (Admin strictly resolves, Non-admin 403)
echo   - Test 5: AI Reroute and Driver Acceptance
echo   - Test 6: Driver Telemetry Scoping (Own vehicle allowed, Others 403)
echo   - Test 7: Field Report Creation, Batch Sync and Conversion
echo   - Test 8: Full RBAC Endpoint Access Matrix
echo.
echo Executing test runner...
echo.

cd /d %~dp0backend
node test_rbac_suite.js

echo.
pause
