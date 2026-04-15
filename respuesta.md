# Pasos para resolver incidentes de negociaciones fallidas

## 1. Consultar los logs de renegociaciones e integración con BackOffice

Ejecutar la sentencia SQL sobre `NAB_COMENTARIOS_RENEGOCIACIONES` para revisar los logs de la gestión y la integración con BackOffice.

## 2. Revisar las tablas relevantes

Consultar las tablas indicadas para identificar el resultado y el alcance de la gestión:

- `NAB_COMERCIAL_CANDIDATOS_BO2`
- `NAB_COMERCIAL_CANDIDATOS_BO_STAGES`
- `NAB_EB_NEGOCIOS`
- `NAB_NEGOCIOS_LINEAS`
- `NAB_COMENTARIOS_RENEGOCIACIONES`
- `NAB_VENTAS_NEGOCIO_INFORMACION_ADICIONAL`

## 3. Identificar el resultado de la gestión

Verificar los campos clave que muestran el resultado y el estado de la operación:

- `Respuesta_Servicio`
- `id_estado`
- `IDPlanAnterior`
- `CodPlanTarifario`
- `IdTicket`

Determinar:

- El número de líneas afectadas
- El código de plan
- El número de ticket

Verificar el estado correspondiente en BackOffice.

## 4. Identificar el número de requerimiento (si aplica)

Consultar `NAB_VENTAS_NEGOCIO_INFORMACION_ADICIONAL` y revisar el campo `ID_PRICING` para obtener el número de requerimiento.

Ejemplo:

- `REQ00000464474`

## 5. Documentar evidencia y pasos de la falla

Preparar un paso a paso de la falla desde el inicio hasta el fin.

Reunir:

- Los datos del contacto autorizado
- Las validaciones de existencia en SalesForce
- Las validaciones de existencia en Greta, según corresponda

## 6. Evaluar y ejecutar escalamiento (cuando corresponda)

- Para fallas en Mcare de empresas fijas, usar la matriz de escalamiento.
- Antes de escalar a Axon o a otras áreas, adjuntar los documentos obligatorios.

## 7. Comunicación al usuario y cierre

Si la funcionalidad no está soportada por T.I., usar el script de cierre.

## 8. Seguimiento y cierre del incidente

- Hacer seguimiento del `IdTicket` y del `ID_PRICING` hasta la resolución.
- Confirmar en BackOffice que las líneas y campos afectados quedaron actualizados.