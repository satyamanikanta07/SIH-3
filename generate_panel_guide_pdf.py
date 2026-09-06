"""
Generates an executive, publication-grade PDF presentation and defense guide
for the NER Smart Logistics & Accessibility Intelligence Platform.
Covers complete project understanding, technical architecture, live panel demo script,
comprehensive 'Who can See, Do, and Modify What' permissions matrix, and panel defense Q&A.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Running Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "NER Smart Logistics & Accessibility Intelligence Platform — Panel Defense Guide")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            
        # Running Footer
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "NER Smart Logistics Platform — Ministry of Development of North Eastern Region (MDoNER)")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_str)
        self.restoreState()

def generate_pdf(output_filename="NER_Smart_Logistics_Complete_Project_Guide.pdf"):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Typography
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a')
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#2563eb')
    )
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#64748b')
    )
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1e3a8a'),
        spaceBefore=14,
        spaceAfter=6
    )
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=8,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor('#334155')
    )
    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor('#1e293b')
    )
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor('#334155'),
        leftIndent=12,
        firstLineIndent=-8
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#1e293b')
    )
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#0f172a')
    )
    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=colors.white
    )

    story = []

    # -------------------------------------------------------------
    # COVER / HEADER BANNER
    # -------------------------------------------------------------
    story.append(Paragraph("AI-Based Smart Logistics & Accessibility Intelligence Platform", title_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph("Comprehensive Project Explanation, Technical Architecture & Panel Defense Guide", subtitle_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph("Region: North Eastern Region of India (Assam, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Arunachal Pradesh, Sikkim)", meta_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1e40af'), spaceAfter=10))

    # -------------------------------------------------------------
    # SECTION 1: THE ELEVATOR PITCH & REAL-WORLD PROBLEM
    # -------------------------------------------------------------
    story.append(Paragraph("1. Executive Summary & The 30-Second Elevator Pitch", h1_style))
    
    pitch_text = (
        "<b>The 30-Second Panel Introduction:</b><br/>"
        "<i>'Respected panel members: Our platform is an AI-driven smart logistics and disaster resilience command system "
        "engineered specifically for the 8 North Eastern States of India. The North East faces extreme geographical isolation, "
        "single-arterial highway choke points (such as NH-2 in Manipur, NH-6 in Meghalaya, and the Siliguri corridor), "
        "and catastrophic monsoon landslides. When a road is washed out, life-saving supplies—pediatric vaccines, emergency medicines, "
        "and food rations—are stranded for days because drivers receive no advance warning and field inspectors lose network connectivity.<br/><br/>"
        "Our platform solves this with 4 synchronized innovations: <b>Predictive AI</b> that forecasts road collapses before trucks depart, "
        "<b>Automated Supply Chain Rerouting</b>, <b>Zero-Connectivity Offline Synchronization</b> using IndexedDB for remote valleys, "
        "and a <b>Multilingual Early Warning Network</b> in English, Hindi, Assamese, and Bengali. It establishes a unified operational "
        "picture between State Disaster Authorities, Logistics Coordinators, Field Inspectors, and Commercial Drivers.'</i>"
    )

    t_pitch = Table([[Paragraph(pitch_text, callout_style)]], colWidths=[7.0*inch])
    t_pitch.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0f9ff')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#bae6fd')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(t_pitch)
    story.append(Spacer(1, 10))

    # -------------------------------------------------------------
    # SECTION 2: CORE PROBLEMS & HOW THE SYSTEM SOLVES THEM
    # -------------------------------------------------------------
    story.append(Paragraph("2. Critical Regional Challenges vs. System Innovations", h1_style))
    
    challenges_data = [
        [
            Paragraph("North Eastern Challenge", table_header),
            Paragraph("Impact on Essential Logistics", table_header),
            Paragraph("Engineered System Solution", table_header)
        ],
        [
            Paragraph("<b>Single Arterial Corridors</b>", table_cell_bold),
            Paragraph("Capitals like Imphal or Aizawl rely on 1-2 highways. A single slide halts all supplies.", table_cell),
            Paragraph("<b>Dynamic GIS Accessibility Matrix</b>: Calculates live accessibility score (0-100%) for all districts in real time.", table_cell)
        ],
        [
            Paragraph("<b>Delayed Reaction Time</b>", table_cell_bold),
            Paragraph("Disaster news travels slowly; supply trucks drive into active landslides and get trapped.", table_cell),
            Paragraph("<b>AI ML Disruption Prediction</b>: Multi-factor machine learning forecasts road failures 2-6 hours ahead.", table_cell)
        ],
        [
            Paragraph("<b>Zero Cellular Connectivity</b>", table_cell_bold),
            Paragraph("Mountain gorges have no internet; field officers cannot submit damage reports.", table_cell),
            Paragraph("<b>True IndexedDB Offline Storage</b>: Field officers queue GPS and photos offline; auto-syncs when online.", table_cell)
        ],
        [
            Paragraph("<b>Agency Silos (PWD / NDMA / Freight)</b>", table_cell_bold),
            Paragraph("Police, highway engineers, and commercial carriers operate with fragmented data.", table_cell),
            Paragraph("<b>Automated Cascading Triggers</b>: Blocking a road instantly fires alerts, reroutes trucks, and flags deliveries.", table_cell)
        ],
        [
            Paragraph("<b>Linguistic Diversity</b>", table_cell_bold),
            Paragraph("Emergency alerts in English fail to reach rural truck drivers and local field crews.", table_cell),
            Paragraph("<b>Multilingual Alert Engine</b>: Translates into English, Hindi, Assamese, and Bengali preserving technical IDs.", table_cell)
        ]
    ]

    t_challenges = Table(challenges_data, colWidths=[1.8*inch, 2.5*inch, 2.7*inch])
    t_challenges.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
    ]))
    story.append(t_challenges)
    story.append(Spacer(1, 10))

    # -------------------------------------------------------------
    # SECTION 3: SYSTEM ARCHITECTURE & TECHNICAL STACK
    # -------------------------------------------------------------
    story.append(Paragraph("3. End-to-End Technical Architecture", h1_style))
    story.append(Paragraph(
        "The platform is architected as a modular, high-availability web and microservice ecosystem:",
        body_style
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph("• <b>Frontend Layer (React 19 + Vite)</b>: Single Page Application with interactive Leaflet GIS maps, Recharts data visualization, dynamic polyline rendering (🟢 Open, 🟡 Risky, 🔴 Blocked), and bridge indicators (🌉).", bullet_style))
    story.append(Paragraph("• <b>Offline Persistence Engine (IndexedDB)</b>: Uses browser-native <code>NER_LOGISTICS_OFFLINE_DB</code> to store full-resolution camera photographs and GPS coordinates without the 5MB limits of localStorage.", bullet_style))
    story.append(Paragraph("• <b>Core Backend (Node.js + Express)</b>: RESTful microservice managing JWT authentication, cascading road blockage engines, Multer photo uploads, and strict role authorization middleware.", bullet_style))
    story.append(Paragraph("• <b>AI / ML Disruption Engine (FastAPI + Python)</b>: Microservice utilizing Random Forest classification trained on rainfall (mm/hr), hill slope gradient (%), soil saturation, and historical slide frequency.", bullet_style))
    story.append(Paragraph("• <b>Database Layer (MongoDB)</b>: Persistent NoSQL storage across 10 collections: Roads, Vehicles, Deliveries, Incidents, FieldReports, Districts, WeatherData, Alerts, AuditLogs, Users.", bullet_style))
    story.append(Paragraph("• <b>External Integration Layer</b>: Adapters for OpenWeather/IMD weather caching, VAHAN commercial vehicle telematics, and NDMA/SDMA disaster advisories.", bullet_style))
    story.append(Spacer(1, 10))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # SECTION 4: USER ROLES, VISIBILITY & MODIFICATION MATRIX
    # -------------------------------------------------------------
    story.append(Paragraph("4. User Roles & Governance: Who Can See, Do, and Modify What", h1_style))
    story.append(Paragraph(
        "To ensure operational security, chain of command, and legal compliance, the platform enforces "
        "a strict 4-tier Role-Based Access Control (RBAC) model verified across 36 automated security tests.",
        body_style
    ))
    story.append(Spacer(1, 6))

    # Detailed breakdown per role
    role_breakdowns = [
        ("👨‍💼 1. Platform Admin (`admin`) — Full System Authority", [
            ("What this user can SEE:", "All 8 state dashboards, complete fleet telematics, entire road network, full dispatches, all incident records, multi-agency audit logs, and system analytics."),
            ("What this user can DO:", "Dispatch new delivery consignments, broadcast emergency disaster alerts, register vehicles, trigger interactive simulations, and review security logs."),
            ("What this user can MODIFY:", "Full CRUD on deliveries (create, reassign, cancel, reprioritize), override road statuses (Open/Risky/Blocked), and <b>exclusively authorize Incident Resolution</b> (transitioning incidents to 'Resolved')."),
            ("Restrictions:", "None. Admin holds master operational oversight across all modules.")
        ]),
        ("🏛️ 2. Government Official (`government_official`) — Infrastructure & Disaster Oversight", [
            ("What this user can SEE:", "Central command dashboard, live road accessibility, bottleneck analytics, district surveillance scores, incident logs, and weather hazard advisories."),
            ("What this user can DO:", "Investigate reported road hazards, promote verified field reports into official active incidents, and select official AI bypass routes."),
            ("What this user can MODIFY:", "Change highway corridor status (e.g. set road to <code>Blocked</code> or <code>Risky</code>), confirm incident status (Reported → Under Investigation → Confirmed)."),
            ("Restrictions:", "<b>Cannot dispatch deliveries</b>, <b>cannot broadcast emergency alerts</b>, and <b>cannot resolve incidents</b> (blocked by backend with HTTP 403 Forbidden).")
        ]),
        ("👷 3. Field Officer (`field_officer`) — Ground Reconnaissance & Inspection", [
            ("What this user can SEE:", "Field intelligence page, active road status, regional alerts, and their own submitted field reports."),
            ("What this user can DO:", "Submit ground hazard reports with auto-captured GPS coordinates, attach camera photo evidence, queue reports offline, and execute batch synchronization."),
            ("What this user can MODIFY:", "Manage local IndexedDB offline reports queue (create, retry, bulk sync to central cloud database)."),
            ("Restrictions:", "<b>Cannot modify road statuses</b>, <b>cannot dispatch or reassign trucks</b>, <b>cannot confirm/resolve incidents</b>, and <b>cannot access audit logs</b> (blocked with HTTP 403 Forbidden).")
        ]),
        ("🚗 4. Driver (`driver`) — Point-to-Point Fleet Transit Execution", [
            ("What this user can SEE:", "Assigned vehicle telemetry (<code>NER-101</code>), assigned delivery consignments, regional road blockage alerts, and turn-by-turn alternate bypass recommendations."),
            ("What this user can DO:", "Acknowledge hazard alerts, accept recommended detour bypasses on mobile console, and view safe route options."),
            ("What this user can MODIFY:", "Update real-time telemetry for their <b>assigned vehicle only</b> (speed in km/h, fuel percentage, live GPS ping)."),
            ("Restrictions:", "<b>Strict vehicle scoping</b>: Attempting to update another vehicle (e.g. NER-105) returns HTTP 403 Forbidden. Cannot modify roads, create dispatches, or view analytics.")
        ])
    ]

    for role_title, details in role_breakdowns:
        story.append(Paragraph(role_title, h2_style))
        for label, desc in details:
            story.append(Paragraph(f"• <b>{label}</b> {desc}", bullet_style))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 6))

    # Comprehensive Master Permissions Table
    story.append(Paragraph("Master Permissions & Operations Matrix", h2_style))

    perm_table_data = [
        [
            Paragraph("Operational Capability / Module", table_header),
            Paragraph("Admin", table_header),
            Paragraph("Govt Official", table_header),
            Paragraph("Field Officer", table_header),
            Paragraph("Driver", table_header)
        ],
        [
            Paragraph("View Central Dashboard & District Matrix", table_cell_bold),
            Paragraph("<font color='#059669'>Full Access</font>", table_cell),
            Paragraph("<font color='#059669'>Full Access</font>", table_cell),
            Paragraph("<font color='#64748b'>Standard</font>", table_cell),
            Paragraph("<font color='#64748b'>Standard</font>", table_cell)
        ],
        [
            Paragraph("Modify Road Status (Open / Risky / Blocked)", table_cell_bold),
            Paragraph("<font color='#059669'><b>Modify (200)</b></font>", table_cell),
            Paragraph("<font color='#059669'><b>Modify (200)</b></font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell)
        ],
        [
            Paragraph("Create / Cancel / Reassign Deliveries", table_cell_bold),
            Paragraph("<font color='#059669'><b>Modify (201)</b></font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell)
        ],
        [
            Paragraph("View Delivery Consignments", table_cell_bold),
            Paragraph("<font color='#059669'>See All (200)</font>", table_cell),
            Paragraph("<font color='#059669'>See All (200)</font>", table_cell),
            Paragraph("<font color='#059669'>See All (200)</font>", table_cell),
            Paragraph("<font color='#2563eb'><b>See Own (200)</b></font>", table_cell)
        ],
        [
            Paragraph("Broadcast Emergency Disaster Alerts", table_cell_bold),
            Paragraph("<font color='#059669'><b>Broadcast (201)</b></font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell)
        ],
        [
            Paragraph("Read & Acknowledge Regional Alerts", table_cell_bold),
            Paragraph("<font color='#059669'>See & Acknowledge</font>", table_cell),
            Paragraph("<font color='#059669'>See & Acknowledge</font>", table_cell),
            Paragraph("<font color='#059669'>See & Acknowledge</font>", table_cell),
            Paragraph("<font color='#059669'><b>See & Acknowledge</b></font>", table_cell)
        ],
        [
            Paragraph("Submit Field Hazard Report (GPS + Camera)", table_cell_bold),
            Paragraph("<font color='#059669'>Create (201)</font>", table_cell),
            Paragraph("<font color='#059669'>Create (201)</font>", table_cell),
            Paragraph("<font color='#059669'><b>Primary Creator (201)</b></font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell)
        ],
        [
            Paragraph("Queue Offline Reports in IndexedDB & Batch Sync", table_cell_bold),
            Paragraph("<font color='#059669'>Full Support</font>", table_cell),
            Paragraph("<font color='#059669'>Full Support</font>", table_cell),
            Paragraph("<font color='#059669'><b>Primary Operator</b></font>", table_cell),
            Paragraph("<font color='#64748b'>N/A</font>", table_cell)
        ],
        [
            Paragraph("Promote Field Report to Official Live Incident", table_cell_bold),
            Paragraph("<font color='#059669'><b>Modify (200)</b></font>", table_cell),
            Paragraph("<font color='#059669'><b>Modify (200)</b></font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell)
        ],
        [
            Paragraph("Confirm Active Incident (Under Investigation)", table_cell_bold),
            Paragraph("<font color='#059669'><b>Modify (200)</b></font>", table_cell),
            Paragraph("<font color='#059669'><b>Modify (200)</b></font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell)
        ],
        [
            Paragraph("Resolve Incident (Close Emergency)", table_cell_bold),
            Paragraph("<font color='#059669'><b>Sole Authority (200)</b></font>", table_cell),
            Paragraph("<font color='#dc2626'><b>Blocked (403)</b></font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell)
        ],
        [
            Paragraph("Select Official AI Bypass Reroute", table_cell_bold),
            Paragraph("<font color='#059669'><b>Select (200)</b></font>", table_cell),
            Paragraph("<font color='#059669'><b>Select (200)</b></font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell)
        ],
        [
            Paragraph("Accept Reroute on Driver Console", table_cell_bold),
            Paragraph("<font color='#64748b'>Can Inspect</font>", table_cell),
            Paragraph("<font color='#64748b'>Can Inspect</font>", table_cell),
            Paragraph("<font color='#64748b'>N/A</font>", table_cell),
            Paragraph("<font color='#059669'><b>Execute & Accept (200)</b></font>", table_cell)
        ],
        [
            Paragraph("Update Vehicle Telemetry (Speed/Fuel/GPS)", table_cell_bold),
            Paragraph("<font color='#059669'>All Vehicles (200)</font>", table_cell),
            Paragraph("<font color='#059669'>All Vehicles (200)</font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell),
            Paragraph("<font color='#2563eb'><b>Own Vehicle Only (200)</b></font>", table_cell)
        ],
        [
            Paragraph("View Deep Analytics & Bottlenecks", table_cell_bold),
            Paragraph("<font color='#059669'><b>See All (200)</b></font>", table_cell),
            Paragraph("<font color='#059669'><b>See All (200)</b></font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell)
        ],
        [
            Paragraph("Inspect Multi-Agency Security Audit Logs", table_cell_bold),
            Paragraph("<font color='#059669'><b>Full Access (200)</b></font>", table_cell),
            Paragraph("<font color='#059669'><b>Full Access (200)</b></font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell),
            Paragraph("<font color='#dc2626'>Blocked (403)</font>", table_cell)
        ],
        [
            Paragraph("Control Live Simulation (Run / Pause / Reset)", table_cell_bold),
            Paragraph("<font color='#059669'>Full Control</font>", table_cell),
            Paragraph("<font color='#059669'>Full Control</font>", table_cell),
            Paragraph("<font color='#64748b'>View Only</font>", table_cell),
            Paragraph("<font color='#64748b'>View Only</font>", table_cell)
        ]
    ]

    t_perm = Table(perm_table_data, colWidths=[2.6*inch, 1.1*inch, 1.1*inch, 1.1*inch, 1.1*inch])
    t_perm.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
    ]))
    story.append(t_perm)
    story.append(Spacer(1, 10))

    story.append(PageBreak())

    # -------------------------------------------------------------
    # SECTION 5: LIVE DEMO SCRIPT FOR THE PANEL
    # -------------------------------------------------------------
    story.append(Paragraph("5. Step-by-Step Live Demo Presentation Script", h1_style))
    story.append(Paragraph(
        "Follow this exact 6-step walkthrough during your live demonstration to prove complete end-to-end functionality:",
        body_style
    ))
    story.append(Spacer(1, 6))

    demo_steps = [
        ("Step 1: The Central Cockpit (Dashboard & District Matrix)",
         "Log in as Admin (admin@nerlogistics.gov.in / admin123). Point to monitored roads, fleet statuses, and the dynamic District Connectivity Matrix table calculating live accessibility percentages across Kamrup, East Khasi Hills, Imphal West, etc."),
        ("Step 2: Geospatial Situation Awareness (Live GIS Map)",
         "Navigate to Live Map. Show color-coded polylines (Green=Open, Amber=Risky, Red=Blocked). Point out active vehicle trucks carrying medicines and clickable structural bridge icons (🌉)."),
        ("Step 3: Triggering a Disaster Event (Cascading Automation)",
         "Click on road NH-02-MN Imphal-Kohima Highway, change status to 'Blocked' with reason 'Major Landslide at Km 42'. Show that the platform automatically: (1) turns road red, (2) generates a Critical Emergency Alert, and (3) marks active medicine deliveries as 'At Risk'."),
        ("Step 4: AI Route Engine & Driver Rerouting",
         "Navigate to Routes. Explain how the AI engine computes an alternate bypass via Dimapur Bypass (+45 min, low slope risk). Show the government selection and how the driver accepts the reroute on their console."),
        ("Step 5: Zero-Connectivity Ground Intelligence (IndexedDB)",
         "Navigate to Field Reports. Click '📡 Simulate Offline Mode'. Submit a new field report with GPS and photo evidence. Show the '🟠 Pending Sync: 1' badge stored in IndexedDB. Turn offline mode off, click 'Sync Now', and show it transition to '🟢 Synced' in MongoDB."),
        ("Step 6: Multilingual Broadcast & Panel Language Switch",
         "Go to Alerts. Use the language selector to switch to Assamese (অসমীয়া), Bengali (বাংলা), or Hindi (हिन्दी). Show that alert messages translate accurately while technical identifiers (NH-2, NER-101, delay times) remain exact and uncorrupted.")
    ]

    for title, script in demo_steps:
        story.append(Paragraph(f"<b>{title}</b>", h2_style))
        story.append(Paragraph(script, body_style))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 6))

    # -------------------------------------------------------------
    # SECTION 6: PANEL Q&A CHEAT SHEET
    # -------------------------------------------------------------
    story.append(Paragraph("6. Anticipated Panel Questions & High-Scoring Defense Answers", h1_style))

    qna_list = [
        ("Q: Where does the Machine Learning model get its data and how does it predict?",
         "A: Our ML microservice runs in Python using a Random Forest classifier. It ingests 4 continuous parameters: (1) real-time precipitation from meteorological sensors, (2) terrain slope gradient percentage, (3) soil saturation index, and (4) historical landslide frequencies. When rainfall exceeds 100mm and slope saturation hits 85%, it outputs an 88%+ disruption probability, triggering proactive warnings before trucks depart."),
        ("Q: Why did you use IndexedDB instead of localStorage for offline mode?",
         "A: LocalStorage has a strict 5MB synchronous quota. A single mobile camera photograph in base64 format exceeds 4MB, instantly causing a QuotaExceededError crash. IndexedDB is an asynchronous, transactional NoSQL database native to browsers that safely stores hundreds of megabytes of binary image blobs, manages sync retry queues, and guarantees zero duplicate submissions upon reconnection."),
        ("Q: How do you prevent drivers or officers from tampering with road statuses?",
         "A: We enforce a 2-tier security architecture: frontend route guards and backend JWT role-based middleware. Any state-modifying endpoint checks the decoded user role. If a Driver attempts to block a road, the server rejects it with an immediate HTTP 403 Forbidden. Furthermore, only Admins have the legal authority to mark an incident as 'Resolved'."),
        ("Q: What happens if a driver fails to acknowledge the alternate route?",
         "A: The system automatically monitors delivery progression. If a road is blocked and the driver does not acknowledge the reroute within 15 minutes, the delivery status shifts to 'At Risk' and elevates to the top of the Logistics Bottlenecks queue on the central dashboard, prompting dispatch coordinators to initiate direct telematics/voice intervention."),
        ("Q: Can this platform be deployed in other mountainous regions of India?",
         "A: Yes. The architecture is modular and decoupled. Geographic corridors, terrain elevation profiles, and weather endpoints are stored in MongoDB. By importing GIS shapefiles for any mountainous region—such as Uttarakhand's Char Dham highway or Himachal Pradesh—the identical predictive routing and offline response pipelines deploy immediately.")
    ]

    for q, a in qna_list:
        story.append(Paragraph(f"<b>{q}</b>", h2_style))
        story.append(Paragraph(a, body_style))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 6))

    # -------------------------------------------------------------
    # SECTION 7: DEMO CREDENTIALS & RUN SCRIPTS
    # -------------------------------------------------------------
    story.append(Paragraph("7. Test Credentials & Rapid Execution Scripts", h1_style))
    
    creds_data = [
        [
            Paragraph("User Role", table_header),
            Paragraph("Login Email", table_header),
            Paragraph("Password", table_header),
            Paragraph("What to Showcase in Panel Demo", table_header)
        ],
        [
            Paragraph("<b>Admin</b>", table_cell_bold),
            Paragraph("admin@nerlogistics.gov.in", table_cell),
            Paragraph("admin123", table_cell),
            Paragraph("Command dashboard, alert broadcasts, dispatch CRUD, incident resolution, audit logs", table_cell)
        ],
        [
            Paragraph("<b>Govt Official</b>", table_cell_bold),
            Paragraph("official@nerlogistics.gov.in", table_cell),
            Paragraph("govt123", table_cell),
            Paragraph("Road blockage, AI alternate route selection, field report promotion to live incident", table_cell)
        ],
        [
            Paragraph("<b>Field Officer</b>", table_cell_bold),
            Paragraph("field@nerlogistics.gov.in", table_cell),
            Paragraph("field123", table_cell),
            Paragraph("Mobile field report submission with GPS, photo upload, offline mode, IndexedDB sync", table_cell)
        ],
        [
            Paragraph("<b>Driver</b>", table_cell_bold),
            Paragraph("driver@nerlogistics.gov.in", table_cell),
            Paragraph("driver123", table_cell),
            Paragraph("Assigned truck (NER-101) telemetry console (speed/fuel), detour acceptance", table_cell)
        ]
    ]

    t_creds = Table(creds_data, colWidths=[1.1*inch, 2.0*inch, 0.9*inch, 3.0*inch])
    t_creds.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
    ]))
    story.append(t_creds)
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Quick Execution Batch Scripts:</b>", body_style))
    story.append(Paragraph("• <code>run.bat</code>: Boots Python ML (8000), Backend (5000), and Frontend (5173), displays credentials, and opens browser.", bullet_style))
    story.append(Paragraph("• <code>node backend/test_rbac_suite.js</code>: Verifies all 36 RBAC permissions and security rules.", bullet_style))
    story.append(Paragraph("• <code>node backend/test_e2e_flow.js</code>: Verifies the complete 15-step disaster lifecycle end-to-end.", bullet_style))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated: {output_filename}")

if __name__ == '__main__':
    current_dir = os.path.dirname(os.path.abspath(__file__))
    target_path = os.path.join(current_dir, "NER_Smart_Logistics_Complete_Project_Guide.pdf")
    generate_pdf(target_path)
