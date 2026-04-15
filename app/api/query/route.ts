import { NextRequest, NextResponse } from 'next/server'
import type { ApiQueryResponse } from '@/lib/types'

// Artificial delay to simulate AI processing time
const SIMULATED_DELAY_MS = 1200

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Mock response for "negociaciones fallidas" queries
const negociacionesResponse: ApiQueryResponse = {
  answer: {
    content: [
      {
        type: 'text',
        data: '# Pasos para resolver incidentes de negociaciones fallidas\n\n1. Consultar los logs de renegociaciones e integración con BackOffice\n   - Ejecutar la sentencia SQL sobre NAB_COMENTARIOS_RENEGOCIACIONES para revisar los logs de la gestión y la integración con BackOffice.\n\n2. Revisar las tablas relevantes\n   - Consultar las tablas indicadas para identificar el resultado y el alcance de la gestión:\n     - NAB_COMERCIAL_CANDIDATOS_BO2\n     - NAB_COMERCIAL_CANDIDATOS_BO_STAGES\n     - NAB_EB_NEGOCIOS\n     - NAB_NEGOCIOS_LINEAS\n     - NAB_COMENTARIOS_RENEGOCIACIONES\n     - NAB_VENTAS_NEGOCIO_INFORMACION_ADICIONAL\n\n3. Identificar el resultado de la gestión\n   - Verificar campos clave que muestran el resultado y el estado de la operación: Respuesta_Servicio, id_estado, IDPlanAnterior, CodPlanTarifario, IdTicket.\n   - Determinar el número de líneas afectadas, el código de plan y el número de ticket.\n   - Verificar el estado correspondiente en BackOffice.\n\n4. Identificar el número de requerimiento (si aplica)\n   - Consultar NAB_VENTAS_NEGOCIO_INFORMACION_ADICIONAL y revisar el campo ID_PRICING para obtener el número de requerimiento (ej.: REQ00000464474).\n\n5. Documentar evidencia y pasos de la falla\n   - Preparar un paso a paso de la falla desde el inicio hasta el fin.\n   - Reunir los datos del contacto autorizado.\n   - Registrar las validaciones de existencia en SalesForce y Greta según corresponda.\n\n6. Evaluar y ejecutar escalamiento (cuando corresponda)\n   - Para fallas en Mcare de empresas fijas, usar la matriz de escalamiento.\n   - Antes de escalar a Axon o a otras áreas, adjuntar los documentos obligatorios.\n\n7. Comunicación al usuario y cierre\n   - Si la funcionalidad no está soportada por T.I., usar el script de cierre.\n\n8. Seguimiento y cierre del incidente\n   - Hacer seguimiento del IdTicket y del ID_PRICING hasta la resolución.\n   - Confirmar en BackOffice que las líneas y campos afectados quedaron actualizados.',
      },
      {
        type: 'picture',
        url: '/img-pruebas/SOP-001-Instructivo Generalidades MCARE N1_Autogestión-picture-005.png',
      },
      {
        type: 'picture',
        url: '/img-pruebas/SOP-001-Instructivo Generalidades MCARE N1_Autogestión-picture-008.png',
      },
      {
        type: 'picture',
        url: '/img-pruebas/SOP-001-Instructivo Generalidades MCARE N1_Autogestión-picture-011.png',
      },
    ],
  },
}

// Generic mock response for other questions
function buildGenericResponse(question: string): ApiQueryResponse {
  const lowerQuestion = question.toLowerCase()

  // Response for technical questions about SQL or databases
  if (
    lowerQuestion.includes('sql') ||
    lowerQuestion.includes('consulta') ||
    lowerQuestion.includes('base de datos') ||
    lowerQuestion.includes('tabla')
  ) {
    return {
      answer: {
        content: [
          {
            type: 'text',
            data: `# Consulta técnica: Base de datos\n\nPara resolver tu consulta sobre **"${question}"**, te recomiendo los siguientes pasos:\n\n## Pasos generales\n\n1. **Identificar las tablas involucradas** — Revisar el esquema de la base de datos para ubicar las entidades relevantes.\n2. **Construir la consulta SQL** — Usar JOINs apropiados y filtros por fecha o estado.\n3. **Validar los resultados** — Cruzar con los registros esperados en el sistema.\n\n## Ejemplo de consulta base\n\n\`\`\`sql\nSELECT\n  c.id_candidato,\n  c.estado,\n  n.id_negocio,\n  n.cod_plan_tarifario\nFROM NAB_COMERCIAL_CANDIDATOS_BO2 c\nINNER JOIN NAB_EB_NEGOCIOS n ON c.id_negocio = n.id_negocio\nWHERE c.fecha_gestion >= SYSDATE - 7\nORDER BY c.fecha_gestion DESC;\n\`\`\`\n\n> **Nota:** Ajusta los filtros de fecha y las columnas según el contexto específico del incidente que estés investigando.`,
          },
        ],
      },
    }
  }

  // Response for escalation or support questions
  if (
    lowerQuestion.includes('escal') ||
    lowerQuestion.includes('soporte') ||
    lowerQuestion.includes('ticket') ||
    lowerQuestion.includes('incidente')
  ) {
    return {
      answer: {
        content: [
          {
            type: 'text',
            data: `# Proceso de escalamiento de incidentes\n\nPara gestionar el incidente relacionado con **"${question}"**, sigue el siguiente flujo:\n\n## Niveles de soporte\n\n- **Nivel 1 (N1):** Atención inicial, validación básica y registro en el sistema de tickets.\n- **Nivel 2 (N2):** Análisis técnico profundo, revisión de logs y escalamiento a áreas especializadas.\n- **Nivel 3 (N3):** Desarrollo y equipos de infraestructura para problemas sistémicos.\n\n## Criterios de escalamiento\n\n1. El incidente lleva más de **2 horas sin resolución** en N1.\n2. Se detecta un error **sistémico** que afecta a múltiples usuarios.\n3. El cliente es **VIP o corporativo** y requiere SLA prioritario.\n4. Se necesita acceso a sistemas **restringidos al N1**.\n\n## Documentación obligatoria para escalar\n\n- Screenshot del error con timestamp.\n- ID del ticket creado en la plataforma.\n- Datos del contacto autorizado del cliente.\n- Pasos de reproducción del problema.\n\n> Recuerda adjuntar toda la documentación **antes** de escalar para agilizar la resolución.`,
          },
        ],
      },
    }
  }

  // Default generic response
  return {
    answer: {
      content: [
        {
          type: 'text',
          data: `# Respuesta a tu consulta\n\nGracias por tu pregunta sobre **"${question}"**.\n\n## Información disponible\n\nEste asistente está especializado en los procedimientos operativos estándar (SOP) de Coltel. A continuación, algunas orientaciones generales:\n\n### Recursos disponibles\n\n- **Documentación SOP:** Consulta los procedimientos estandarizados para cada tipo de incidente.\n- **Base de conocimiento:** Accede al repositorio de soluciones probadas para problemas recurrentes.\n- **Matriz de escalamiento:** Disponible para determinar el nivel de soporte adecuado.\n\n### Pasos recomendados\n\n1. Identificar el tipo de incidente y el sistema afectado.\n2. Consultar el SOP correspondiente al área.\n3. Documentar todos los pasos realizados.\n4. Si no se resuelve en el tiempo estipulado, escalar con la documentación completa.\n\n> Para consultas más específicas, intenta reformular tu pregunta incluyendo el nombre del sistema, proceso o tabla involucrada.`,
        },
      ],
    },
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const question: string = body?.question ?? ''

    // Validate that question is not empty
    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'La pregunta no puede estar vacía.' },
        { status: 400 }
      )
    }

    // Simulate AI processing delay
    await sleep(SIMULATED_DELAY_MS)

    // Route to appropriate mock response based on question content
    const lowerQuestion = question.toLowerCase()
    let response: ApiQueryResponse

    if (lowerQuestion.includes('negociaciones fallidas')) {
      response = negociacionesResponse
    } else {
      response = buildGenericResponse(question)
    }

    return NextResponse.json(response, { status: 200 })
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor. Por favor intenta de nuevo.' },
      { status: 500 }
    )
  }
}

// Reject non-POST methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Método no permitido.' }, { status: 405 })
}
