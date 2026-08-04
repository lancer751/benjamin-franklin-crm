# Ejemplos de body JSON para endpoints del backend

> Nota: reemplaza los UUIDs y URLs de ejemplo por valores reales antes de probarlos.

## 1) Auth

### POST /api/auth/login
```json
{
  "email": "admin.bf@example.com",
  "password": "Password123#"
}
```

### POST /api/auth/refresh-access-token
Sin body JSON. Se reutiliza la cookie de refresh.

### POST /api/auth/logout
Sin body JSON. Se reutiliza la cookie de refresh.

---

## 2) Usuarios

### POST /api/users
```json
{
  "first_name": "Carlos",
  "middle_name": "Alberto",
  "last_name": "Mendoza",
  "email": "carlos.mendoza@example.com",
  "corporate_email": "carlos.mendoza@bf.edu.pe",
  "cellphone": "987654321",
  "corporate_cellphone": "987654322",
  "role_id": "11111111-1111-1111-1111-111111111111",
  "is_active": true,
  "password": "Password123#",
  "birth_date": "1990-05-14",
  "role": "SALES_REP",
  "seller_profile": {
    "sales_target": 50,
    "assigned_supervisor_id": "22222222-2222-2222-2222-222222222222"
  }
}
```

### PUT /api/users/:id
```json
{
  "first_name": "Carlos",
  "last_name": "Mendoza Ruiz",
  "cellphone": "987654333",
  "is_active": true,
  "password": "NewPassword123#"
}
```

### PUT /api/users/sales-supervisors/:id
```json
{
  "id": "33333333-3333-3333-3333-333333333333",
  "user_id": "44444444-4444-4444-4444-444444444444",
  "max_sellers": 12
}
```

### PUT /api/users/sellers/:id
```json
{
  "id": "55555555-5555-5555-5555-555555555555",
  "user_id": "66666666-6666-6666-6666-666666666666",
  "sales_target": 80,
  "assigned_supervisor_id": "77777777-7777-7777-7777-777777777777"
}
```

---

## 3) Académicos

### POST /api/academic/professors
```json
{
  "name": "Luis",
  "lastname": "Pérez",
  "linkedin_account_url": "https://linkedin.com/in/luisperez",
  "profession": "Docente",
  "curriculum_vitae": "https://example.com/cv/luis.pdf",
  "email": "luis.perez@example.com",
  "corporate_email": "luis.perez@bf.edu.pe",
  "cellphone": "987654321",
  "is_active": true,
  "moddle_account_id": 1002,
  "moodle_user_status": "ACTIVE"
}
```

### PUT /api/academic/professors/:id
```json
{
  "name": "Luis Alberto",
  "lastname": "Pérez Torres",
  "cellphone": "987654322",
  "profession": "Docente Principal"
}
```

### POST /api/academic/courses
```json
{
  "type": "COURSE",
  "name": "Gestión de Ventas Digitales",
  "description": "Curso práctico para vender online.",
  "classes_number": 12,
  "image_url": "https://example.com/images/ventas-digitales.jpg",
  "code": "VENT001"
}
```

### PUT /api/academic/courses/:id
```json
{
  "name": "Gestión de Ventas Digitales Avanzada",
  "description": "Versión avanzada del curso.",
  "classes_number": 14
}
```

### POST /api/academic/editions
```json
{
  "course_id": "88888888-8888-8888-8888-888888888888",
  "edition_number": 1,
  "start_date": "2026-09-01",
  "end_date": "2026-11-30",
  "hours_amount": 40,
  "classes_number": 12,
  "duration_value": 3,
  "duration_unit": "MONTHS",
  "modality": "VIRTUAL",
  "moodle_course_id": 1001,
  "meet_link": "https://meet.google.com/abc-defg-hij",
  "syllabus_url": "https://example.com/syllabus/ventas-digitales.pdf",
  "whatsapp_group_link": "https://chat.whatsapp.com/example",
  "edition_status": "SCHEDULED",
  "edition_code": "LP-001-26-01",
  "assigned_professors": [
    {
      "professor_id": "99999999-9999-9999-9999-999999999999"
    }
  ],
  "schedules": [
    {
      "day_of_week": "LUNES",
      "type": "REGULAR",
      "slots": [
        {
          "start_time": "19:00",
          "end_time": "21:00"
        }
      ]
    }
  ],
  "assignOnlyActiveProfessors": true
}
```

### PUT /api/academic/editions/:id
```json
{
  "edition_status": "OPEN",
  "meet_link": "https://meet.google.com/xyz-uvwx-abc",
  "assigned_professors": [
    {
      "professor_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
    }
  ],
  "schedules": [
    {
      "day_of_week": "MIERCOLES",
      "type": "REGULAR",
      "slots": [
        {
          "start_time": "18:00",
          "end_time": "20:00"
        }
      ]
    }
  ]
}
```

---

## 4) Productos y contenido

### POST /api/products
```json
{
  "name": "Programa de Ventas Digitales",
  "edition_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  "category_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
  "enrollment_fee": "300.00",
  "discount_price": "1200.00",
  "discount_expires_at": "2026-09-15",
  "installments_max_number": 6,
  "installments_min_number": 1,
  "prices": [
    {
      "attendance_mode": "HEREDADO",
      "cash_price": "1500.00",
      "installment_price": "1700.00"
    }
  ]
}
```

### PUT /api/products/:id
```json
{
  "name": "Programa de Ventas Digitales Premium",
  "discount_price": "1000.00",
  "discount_expires_at": "2026-10-15",
  "installments_max_number": 8
}
```

### POST /api/cms/benefits
```json
{
  "description": "Acceso a mentorías grupales",
  "image_url": "https://example.com/images/mentorias.png"
}
```

### PUT /api/cms/benefits/:id
```json
{
  "description": "Acceso a mentorías individuales",
  "image_url": "https://example.com/images/mentorias-individuales.png"
}
```

### POST /api/cms/certifications
```json
{
  "title": "Certificación Digital",
  "description": "Certificado válido por 6 meses",
  "image_url": "https://example.com/images/certificado.png",
  "has_digital": true,
  "has_physical": false,
  "issuing_authority": "Benjamin Franklin",
  "registry_validity": "6 meses"
}
```

### POST /api/cms/faqs
```json
{
  "question": "¿Cuánto dura el curso?",
  "answer": "El curso tiene una duración de 12 semanas.",
  "order": 1
}
```

### POST /api/cms/categories
```json
{
  "name": "ventas"
}
```

### PUT /api/cms/categories/:id
```json
{
  "name": "ventas-digitales"
}
```

### POST /api/discount-codes
```json
{
  "code": "BF2026",
  "type": "PERCENTAGE",
  "value": 10,
  "valid_from": "2026-08-01",
  "valid_until": "2026-12-31",
  "is_active": true,
  "product_id": "dddddddd-dddd-dddd-dddd-dddddddddddd"
}
```

### PUT /api/products/:id/commercial-content
```json
{
  "description": "Programa orientado a ventas y captación de leads.",
  "short_description": "Aprende a vender mejor.",
  "slug": "programa-ventas-digitales",
  "image_url": "https://example.com/images/producto.png",
  "brochure_url": "https://example.com/brochure.pdf",
  "benefit_ids": [
    "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"
  ],
  "faq_ids": [
    "ffffffff-ffff-ffff-ffff-ffffffffffff"
  ],
  "certification_ids": [
    "10101010-1010-1010-1010-101010101010"
  ],
  "sales_status": "PUBLISHED"
}
```

---

## 5) Campañas y leads

### POST /api/campaigns
```json
{
  "name": "Campaña de Lanzamiento Ventas",
  "initial_budget": 5000,
  "start_date": "2026-08-01",
  "end_date": "2026-10-31",
  "platform": "FACEBOOK",
  "is_organic": false,
  "status": "ACTIVE",
  "product_id": "12121212-1212-1212-1212-121212121212",
  "supervisor_id": "13131313-1313-1313-1313-131313131313",
  "meta_campaign_id": null,
  "meta_form_id": null,
  "click_to_whatsapp": false,
  "whatsapp_number": null,
  "seller_ids": [
    "14141414-1414-1414-1414-141414141414"
  ]
}
```

### PUT /api/campaigns/:id
```json
{
  "name": "Campaña de Lanzamiento Ventas Premium",
  "status": "ACTIVE",
  "initial_budget": 6000
}
```

### POST /api/campaigns/:id/sellers
```json
{
  "seller_ids": [
    "15151515-1515-1515-1515-151515151515",
    "16161616-1616-1616-1616-161616161616"
  ]
}
```

### POST /api/leads
```json
{
  "first_name": "Ana",
  "middle_name": "Isabel",
  "last_name": "Torres",
  "email": "ana.torres@example.com",
  "profession": "Diseñadora",
  "gender": "FEMALE",
  "lead_status": "ACTIVE",
  "address": "Av. Siempre Viva 123",
  "secondary_email": "ana.torres.secondary@example.com",
  "dni": "12345678",
  "phones": [
    {
      "number": "987654321",
      "type": "WHATSAPP",
      "isPrincipal": true
    }
  ]
}
```

### PUT /api/leads/:id
```json
{
  "first_name": "Ana María",
  "address": "Av. Benavides 456",
  "phones": [
    {
      "number": "987654322",
      "type": "WHATSAPP",
      "isPrincipal": true
    }
  ]
}
```

### POST /api/campaigns/:campaignId/members
```json
{
  "lead_id": "17171717-1717-1717-1717-171717171717",
  "campaing_id": "18181818-1818-1818-1818-181818181818",
  "assigned_to": "19191919-1919-1919-1919-191919191919",
  "source": "FACEBOOK"
}
```

### PATCH /api/campaigns/:campaignId/members/:memberId/status
```json
{
  "status": "MATRICULADO"
}
```

### PATCH /api/campaigns/:campaignId/members/:memberId/reassign
```json
{
  "assigned_to": "20202020-2020-2020-2020-202020202020"
}
```

### PATCH /api/campaigns/:campaignId/members/reassign-bulk
```json
{
  "member_ids": [
    "21212121-2121-2121-2121-212121212121",
    "22222222-2222-2222-2222-222222222222"
  ],
  "assigned_to": "23232323-2323-2323-2323-232323232323"
}
```

### POST /api/campaigns/:campaignId/members/:memberId/interactions
```json
{
  "notes": "El lead mostró interés por el programa.",
  "type": "WHATSAPP"
}
```

### POST /api/campaigns/:campaignId/members/:memberId/tasks
```json
{
  "title": "Llamar al lead",
  "content": "Confirmar disponibilidad para la próxima sesión.",
  "is_done": false,
  "due_date": "2026-08-10"
}
```

### PATCH /api/campaigns/:campaignId/members/:memberId/tasks/:taskId
```json
{
  "title": "Llamar al lead nuevamente",
  "is_done": true
}
```

---

## 6) Órdenes y pagos

### POST /api/orders
```json
{
  "lead_id": "24242424-2424-2424-2424-242424242424",
  "order_items": [
    {
      "product_id": "25252525-2525-2525-2525-252525252525",
      "attendance_mode": "HEREDADO",
      "payment_modality": "CASH",
      "discount_code": "BF2026"
    }
  ],
  "related_campaign": "26262626-2626-2626-2626-262626262626",
  "generated_by": "27272727-2727-2727-2727-272727272727",
  "assigned_to": "28282828-2828-2828-2828-282828282828"
}
```

### PATCH /api/payments/:id
```json
{
  "payment_status": "COMPLETED"
}
```

---

## 7) Importación masiva

### POST /api/bulk
Body multipart/form-data con un campo llamado `file`.

```text
file: <archivo.xlsx>
```
