# Núcleo Digital · CRM privado de LINK Digital

## Implementación
- Ruta privada incorporada a la web actual de Cloudflare Workers: `/nucleo`.
- Fuente de la interfaz: `nucleo/index.html`.
- Proyecto de datos: Supabase **LINK CONTROL CENTRAL** (`zgbnjlrxzvzpigmwidsp`).
- En lugar de copiar Hotel Experience, reutiliza su lógica: dashboard, biblioteca de clientes, ficha 360°, responsables, estado, planes, notas cronológicas y próximos compromisos.
- La web comercial pública y Hotel Experience se conservan. No se crea un segundo CRM general ni se sincronizan contraseñas.

## Seguridad
- Supabase Auth, sesión de navegador y RLS (control en servidor de datos).
- Solo el usuario Supabase con rol `owner` y UUID autorizado puede leer o escribir dossiers.
- Las funciones de resumen y alta verifican al mismo usuario servidor.
- Las URLs de los convenios son referencias, no credenciales.
- La ruta no figura en el menú público, responde con `no-store` y `noindex`. Que se pueda abrir la pantalla de acceso no significa que se pueda acceder a datos.
- Usuario administrador en Control Central: `gonzalogaraymunoz+link@gmail.com`.

## Base de datos
Migraciones aplicadas directamente al proyecto:
- `link_digital_dossiers_private_v1`
- `link_digital_dossier_fields_v1`
- `link_digital_notes_admin_rls_v1`
- `link_digital_crm_summary_owner_v1`
- `link_digital_crm_create_client_owner_v1`
- `link_digital_seed_caracol_v1`
- `link_digital_propuesta_reference_v1`
- `link_digital_rpc_anon_denial_v1` (funciones restringidas a usuarios autenticados; cada función valida owner en el servidor)

Tablas específicas: `public.link_digital_dossiers` y `public.link_digital_notes`; se relacionan por FK con `public.clients`, que es la entidad existente. Los planes de marketing se leen desde `public.client_plan_assignments` vía RPC protegida.

## Primer caso
- CARACOL vinculado con registro existente en Control Central.
- Etapa: activo (según convenio preexistente).
- Propuesta comercial enlazada: https://propuesta-nine.vercel.app/
- La incorporación de Anahís y Jorge se registra como próxima acción de validación, no se presupone contrato ni tarifa definitiva.

## Operación
- Administrador crea un cliente desde el formulario, que busca primero entidades con el mismo nombre y evita duplicarlas.
- Edita enlaces a Notion, informes, convenios, LINK RRSS y LINK Commerce solo si están realmente configurados.
- Documenta próximas acciones y observaciones en la ficha.
- Registra notas con autor y fecha en una línea de tiempo.
- El valor mostrado en “Planes acordados” procede de un convenio registrado; **no acredita un pago recibido**.

## Pendiente para la siguiente fase
- Enlace automático verificable Zernio → LINK RRSS → informe mensual por cliente.
- Seguimiento de producción en Notion según pauta de Anahís.
- Gestión documental y semáforo de cumplimiento con evidencia externa.
- Pruebas de UI dentro del navegador autenticado del administrador.

## Despliegue
La web actual en producción se sirve desde un Worker Cloudflare monolítico llamado `linkdigital`, **no** desde el antiguo HTML raíz de este repositorio. Para no destruir la web vigente, solo se añadió el enrutamiento `/nucleo` al Worker existente y se conservó íntegra su respuesta pública original. El archivo `nucleo/index.html` versiona la interfaz privada, pero cambiar este archivo en GitHub no lo publicará automáticamente: para actualizar la ruta privada hay que sincronizarla con el Worker y validar el acceso autenticado. No volver a desplegar el antiguo `index.html` raíz sobre producción.

## 15-oct-2026 · Migración del informe Caracol
- Fuente preservada: repositorio `gonzalogaraymunoz-star/propuesta`, commit `a9ca8c0529b9df27d979b8ee53202ed802ace180` (Vercel `propuesta-nine.vercel.app`).
- Copia versionada íntegra: `informes/caracol/2026-09.html` (septiembre: trabajo/resultados; octubre: planificación; preserva todos los bloques del documento original).
- URL nueva en el mismo dominio Cloudflare: `/informes/caracol/2026-09`. El documento de resultados es una vista compartible de solo lectura, sin panel, sesión ni datos internos de Núcleo.
- Logotipo servido por `/informes/caracol/assets/caracol-logo.webp` mediante proxy del Worker a un commit fijado de GitHub. Otras imágenes de publicaciones conservan las URLs originales (Zernio/Instagram), cuya vigencia depende del proveedor.
- La ruta no se anuncia en el sitio comercial; cabeceras `noindex`. IMPORTANTE: el informe es accesible para **cualquier persona con el enlace**, no está protegido por contraseña. No poner contenido confidencial en esta vista sin añadir controles de acceso adicionales.
- Núcleo CRM sigue restringido a propietario autenticado con RLS; no se exponen notas, convenios internos ni márgenes en el informe compartido.
- `link_digital_dossiers.report_url` para Caracol apunta al nuevo informe. `proposal_url` se limpió porque Vercel contenía un **informe**, no la propuesta comercial original; se deja pendiente adjuntar el PDF real. `agreement_url` sigue pendiente, sin inventar.
- La ficha 360° pasó a modo **consulta / navegación**; sin formulario de edición ni creación manual desde la interfaz. La ejecución se gestiona en LINK TASK y la información se conserva en Control Central.
- Despliegue producido mediante Cloudflare Worker `linkdigital` con vista previa compilada y copia de seguridad del script previo: `linkdigital-backup-before-report-20261015`.
- No se eliminó el origen en Vercel para evitar romper enlaces antiguos. Cuando se valide con el cliente se puede retirar o redirigir el dominio anterior.
- Validaciones técnicas: carga de script por Cloudflare API, presencia de ruta privada, ruta de informe y ruta de logotipo, y persistencia de URLs en Supabase. La comprobación visual desde navegador autenticado y la carga de imágenes externas continúan pendientes.
