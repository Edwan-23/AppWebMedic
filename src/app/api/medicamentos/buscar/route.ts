import { NextRequest, NextResponse } from "next/server";

const API_TOKEN = "kZZDAOR8rsMOWIMPfKX3xoQnn";
const API_URL = "https://www.datos.gov.co/resource/i7cb-raxc.json";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filtro = searchParams.get("filtro");
    
    // Obtener filtros aplicados
    const principioactivo = searchParams.get("principioactivo");
    const cantidadcum = searchParams.get("cantidadcum");
    const unidadmedida = searchParams.get("unidadmedida");
    const unidadreferencia = searchParams.get("unidadreferencia");
    const titular = searchParams.get("titular");
    
    // Construir condiciones WHERE para Socrata API
    const whereConditions: string[] = [];
    
    if (principioactivo) {
      // Si estamos buscando principios activos, usar LIKE para autocompletar
      // Si ya se seleccionó uno, usar igualdad exacta para filtros posteriores
      if (filtro === "principioactivo") {
        whereConditions.push(`UPPER(principioactivo) LIKE UPPER('%${principioactivo.replace(/'/g, "''")}%')`);
      } else {
        whereConditions.push(`UPPER(principioactivo)=UPPER('${principioactivo.replace(/'/g, "''")}')`);
      }
    }
    if (cantidadcum) {
      whereConditions.push(`cantidadcum='${cantidadcum.replace(/'/g, "''")}'`);
    }
    if (unidadmedida) {
      whereConditions.push(`UPPER(unidadmedida)=UPPER('${unidadmedida.replace(/'/g, "''")}')`);
    }
    if (unidadreferencia) {
      whereConditions.push(`UPPER(unidadreferencia)=UPPER('${unidadreferencia.replace(/'/g, "''")}')`);
    }
    if (titular) {
      whereConditions.push(`UPPER(titular)=UPPER('${titular.replace(/'/g, "''")}')`);
    }
    
    const params = new URLSearchParams();
    if (whereConditions.length > 0) {
      params.append("$where", whereConditions.join(" AND "));
    }
    params.append("$limit", "10000");
    
    const fullUrl = `${API_URL}?${params.toString()}`;
    
    const response = await fetch(fullUrl, {
      headers: {
        "X-App-Token": API_TOKEN,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error de la API: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (filtro === "principioactivo") {
      // Retornar lista única de principios activos
      const principios = Array.from(
        new Set(
          data
            .map((item: any) => item.principioactivo)
            .filter((p: string) => p && p.trim() !== "")
        )
      ).sort();
      return NextResponse.json(principios);
    }
    
    if (filtro === "cantidadcum") {
      // Retornar lista única de cantidades
      const cantidades = Array.from(
        new Set(
          data
            .map((item: any) => item.cantidadcum)
            .filter((c: string) => c && c.trim() !== "")
        )
      ).sort((a: any, b: any) => parseFloat(a) - parseFloat(b));
      return NextResponse.json(cantidades);
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
      return NextResponse.json(unidades);
    }
    
    if (filtro === "unidadreferencia") {
      // Retornar lista única de unidades de referencia
      const referencias = Array.from(
        new Set(
          data
            .map((item: any) => item.unidadreferencia)
            .filter((r: string) => r && r.trim() !== "")
        )
      ).sort();
      return NextResponse.json(referencias);
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
      return NextResponse.json(titulares);
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
      return NextResponse.json(descripciones);
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
      return NextResponse.json(formas);
    }
    
    // Si no se especifica filtro, retornar el primer resultado completo (medicamento único)
    if (data.length > 0) {
      const medicamento = {
        principioactivo: data[0].principioactivo || null,
        cantidadcum: data[0].cantidadcum || null,
        unidadmedida: data[0].unidadmedida || null,
        formafarmaceutica: data[0].formafarmaceutica || null,
        titular: data[0].titular || null,
        descripcioncomercial: data[0].descripcioncomercial || null,
      };
      return NextResponse.json(medicamento);
    }
    
    return NextResponse.json({ error: "No se encontraron resultados" }, { status: 404 });
    
  } catch (error) {
    console.error("Error en búsqueda de medicamentos:", error);
    return NextResponse.json(
      { error: "Error al buscar medicamentos" },
      { status: 500 }
    );
  }
}
