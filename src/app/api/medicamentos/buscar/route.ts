import { NextRequest, NextResponse } from "next/server";

const API_TOKEN = "kZZDAOR8rsMOWIMPfKX3xoQnn";
const API_URL = "https://www.datos.gov.co/resource/i7cb-raxc.json";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filtro = searchParams.get("filtro");
    const busqueda = searchParams.get("busqueda"); // Para autocompletado
    
    // Obtener filtros aplicados
    const expedientecum = searchParams.get("expedientecum");
    const consecutivocum = searchParams.get("consecutivocum");
    const principioactivo = searchParams.get("principioactivo");
    const cantidad = searchParams.get("cantidad");
    const unidadmedida = searchParams.get("unidadmedida");
    const formafarmaceutica = searchParams.get("formafarmaceutica");
    const titular = searchParams.get("titular");
    
    // condiciones WHERE para Socrata API
    const whereConditions: string[] = [];
    
    // filtrar solo medicamentos activos
    whereConditions.push("UPPER(estadocum)='ACTIVO'");
  
    // cuando hay búsqueda de expediente, usar prefijo numérico
    if (filtro === "expedientecum" && busqueda && busqueda.length >= 3) {
      // Convertir búsqueda a número y crear rango
      const numBusqueda = parseInt(busqueda);
      if (!isNaN(numBusqueda)) {
        // se captura el número exacto Y todos los que empiezan con ese prefijo
        const digitosFaltantes = 8 - busqueda.length;
        const rangoInicio = numBusqueda; 
        const rangoFin = numBusqueda * Math.pow(10, digitosFaltantes) + Math.pow(10, digitosFaltantes) - 1;
        whereConditions.push(`expedientecum >= ${rangoInicio} AND expedientecum <= ${rangoFin}`);
      }
    } else if (expedientecum && !busqueda) {
      whereConditions.push(`expedientecum='${expedientecum.replace(/'/g, "''")}'`);
    }
    
    if (consecutivocum) {
      whereConditions.push(`consecutivocum='${consecutivocum.replace(/'/g, "''")}'`);
    }
    
    if (principioactivo) {
      whereConditions.push(`UPPER(principioactivo)=UPPER('${principioactivo.replace(/'/g, "''")}')`);
    }
    
    if (cantidad) {
      whereConditions.push(`cantidad='${cantidad.replace(/'/g, "''")}'`);
    }
    
    if (unidadmedida) {
      whereConditions.push(`UPPER(unidadmedida)=UPPER('${unidadmedida.replace(/'/g, "''")}')`);
    }
    
    if (formafarmaceutica) {
      whereConditions.push(`UPPER(formafarmaceutica)=UPPER('${formafarmaceutica.replace(/'/g, "''")}')`);
    }
    
    if (titular) {
      whereConditions.push(`UPPER(titular)=UPPER('${titular.replace(/'/g, "''")}')`);
    }
    
    const params = new URLSearchParams();
    if (whereConditions.length > 0) {
      params.append("$where", whereConditions.join(" AND "));
    }
    // Límite para búsquedas filtradas
    params.append("$limit", "30000");
    
    const fullUrl = `${API_URL}?${params.toString()}`;
    
    console.log(`[Búsqueda Medicamentos] Filtro: ${filtro}, URL: ${fullUrl}`);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60 segundos timeout
    
    const response = await fetch(fullUrl, {
      headers: {
        "X-App-Token": API_TOKEN,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      console.error(`[Búsqueda Medicamentos] Error de la API: ${response.status} ${response.statusText}`);
      throw new Error(`Error de la API: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (filtro === "expedientecum") {
      // Retornar lista única de expedientes (máximo 8 dígitos)
      let expedientes = Array.from(
        new Set(
          data
            .map((item: any) => {
              const exp = item.expedientecum;
              // máximo 8 dígitos
              return exp ? exp.toString().trim() : null;
            })
            .filter((e: string | null) => e && e.length <= 8 && /^\d+$/.test(e))
        )
      );
      
      // Se filtra localmente para mayor precisión
      // ( filtró  startsWith)
      if (busqueda) {
        const busquedaStr = busqueda.trim();
        expedientes = (expedientes as string[]).filter((exp: string) => 
          exp.startsWith(busquedaStr)
        );
      }
      
      // Ordenar numéricamente
      expedientes.sort((a, b) => parseInt(a as string) - parseInt(b as string));
      
      console.log(`[Expedientes encontrados] ${expedientes.length} resultados para búsqueda: "${busqueda}"`);
      
      // Limitar a 100 resultados
      return NextResponse.json({ opciones: expedientes.slice(0, 100) });
    }
    
    if (filtro === "consecutivocum") {
      // Retornar lista única de consecutivos
      const consecutivos = Array.from(
        new Set(
          data
            .map((item: any) => item.consecutivocum)
            .filter((c: string) => c && c.trim() !== "")
        )
      );
      // Ordenar numéricamente
      consecutivos.sort((a, b) => parseInt(a as string) - parseInt(b as string));
      return NextResponse.json({ opciones: consecutivos });
    }
    
    if (filtro === "principioactivo") {
      // Retornar lista única de principios activos
      const principios = Array.from(
        new Set(
          data
            .map((item: any) => item.principioactivo)
            .filter((p: string) => p && p.trim() !== "")
        )
      ).sort();
      return NextResponse.json({ opciones: principios });
    }
    
    if (filtro === "cantidad") {
      // Retornar lista única de cantidades
      const cantidades = Array.from(
        new Set(
          data
            .map((item: any) => item.cantidad)
            .filter((c: string) => c && c.trim() !== "")
        )
      ).sort((a: any, b: any) => parseFloat(a) - parseFloat(b));
      return NextResponse.json({ opciones: cantidades });
    }
    
    if (filtro === "unidadmedida") {
      // Retornar lista única de unidades de medida
      const unidades = Array.from(
        new Set(
          data
            .map((item: any) => item.unidadmedida)
            .filter((u: string) => u && u.trim() !== "")
        )
      ).sort();
      return NextResponse.json({ opciones: unidades });
    }
    
    if (filtro === "formafarmaceutica") {
      // Retornar lista única de formas farmacéuticas
      const formas = Array.from(
        new Set(
          data
            .map((item: any) => item.formafarmaceutica)
            .filter((f: string) => f && f.trim() !== "")
        )
      ).sort();
      return NextResponse.json({ opciones: formas });
    }
    
    if (filtro === "titular") {
      // Retornar lista única de titulares (laboratorios)
      const titulares = Array.from(
        new Set(
          data
            .map((item: any) => item.titular)
            .filter((t: string) => t && t.trim() !== "")
        )
      ).sort();
      return NextResponse.json({ opciones: titulares });
    }
    
    if (filtro === "descripcioncomercial") {
      // Retornar lista única de descripciones comerciales
      const descripciones = Array.from(
        new Set(
          data
            .map((item: any) => item.descripcioncomercial)
            .filter((d: string) => d && d.trim() !== "")
        )
      ).sort();
      return NextResponse.json({ opciones: descripciones });
    }
    
    // Si no se especifica filtro, retornar el primer resultado completo (medicamento único)
    if (data.length > 0) {
      const medicamento = {
        principioactivo: data[0].principioactivo || null,
        expedientecum: data[0].expedientecum || null,
        consecutivocum: data[0].consecutivocum || null,
        cantidad: data[0].cantidad || null,
        unidadmedida: data[0].unidadmedida || null,
        formafarmaceutica: data[0].formafarmaceutica || null,
        titular: data[0].titular || null,
        descripcioncomercial: data[0].descripcioncomercial || null,
      };
      return NextResponse.json(medicamento);
    }
    
    return NextResponse.json({ error: "No se encontraron resultados" }, { status: 404 });
    
  } catch (error: any) {
    console.error("[Búsqueda Medicamentos] Error:", error);
    
    // Si es un error de timeout
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: "La búsqueda tardó demasiado tiempo. Intente con un término más específico." },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Error al buscar medicamentos",
        details: error.message || "Error desconocido"
      },
      { status: 500 }
    );
  }
}
