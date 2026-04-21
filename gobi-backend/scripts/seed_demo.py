from datetime import datetime, date
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.diputado import Partido, Diputado
from app.models.comision import Comision
from app.models.proyecto import (
    Tema,
    ProyectoLey,
    CambioEstado,
    Documento,
    Voto,
    EstadoProyecto,
    ValorVoto,
)


def get_or_create_partido(db: Session, nombre: str, color_hex: str, logo_url: str | None = None) -> Partido:
    item = db.query(Partido).filter(Partido.nombre == nombre).first()
    if item:
        return item
    item = Partido(nombre=nombre, color_hex=color_hex, logo_url=logo_url)
    db.add(item)
    db.flush()
    return item


def get_or_create_diputado(
    db: Session,
    nombre: str,
    partido: Partido,
    salario: int,
    monto_gasolina: int,
    fecha_inicio: date,
    foto_url: str | None = None,
) -> Diputado:
    item = db.query(Diputado).filter(Diputado.nombre == nombre).first()
    if item:
        return item
    item = Diputado(
        nombre=nombre,
        partido_id=partido.id,
        salario=salario,
        monto_gasolina=monto_gasolina,
        fecha_inicio=fecha_inicio,
        foto_url=foto_url,
    )
    db.add(item)
    db.flush()
    return item


def get_or_create_comision(db: Session, nombre: str, descripcion: str | None = None) -> Comision:
    item = db.query(Comision).filter(Comision.nombre == nombre).first()
    if item:
        return item
    item = Comision(nombre=nombre, descripcion=descripcion)
    db.add(item)
    db.flush()
    return item


def get_or_create_tema(db: Session, nombre: str, slug: str, color_hex: str) -> Tema:
    item = db.query(Tema).filter(Tema.slug == slug).first()
    if item:
        return item
    item = Tema(nombre=nombre, slug=slug, color_hex=color_hex)
    db.add(item)
    db.flush()
    return item


def get_or_create_proyecto(
    db: Session,
    codigo: str,
    titulo: str,
    descripcion: str,
    fecha_presentacion: date,
    estado: EstadoProyecto,
    proponente: Diputado,
    comision: Comision | None,
    temas: list[Tema],
    texto_completo: str | None = None,
) -> ProyectoLey:
    item = db.query(ProyectoLey).filter(ProyectoLey.codigo == codigo).first()
    if item:
        return item

    item = ProyectoLey(
        codigo=codigo,
        titulo=titulo,
        descripcion=descripcion,
        texto_completo=texto_completo,
        estado=estado,
        fecha_presentacion=fecha_presentacion,
        proponente_id=proponente.id,
        comision_id=comision.id if comision else None,
    )
    item.temas = temas
    db.add(item)
    db.flush()
    return item


def add_historial_if_empty(
    db: Session,
    proyecto: ProyectoLey,
    cambios: list[tuple[EstadoProyecto, EstadoProyecto, str, str]],
) -> None:
    existente = db.query(CambioEstado).filter(CambioEstado.proyecto_id == proyecto.id).first()
    if existente:
        return

    for estado_anterior, estado_nuevo, motivo, usuario_nombre in cambios:
        db.add(
            CambioEstado(
                proyecto_id=proyecto.id,
                estado_anterior=estado_anterior,
                estado_nuevo=estado_nuevo,
                motivo=motivo,
                usuario_id="seed-script",
                usuario_nombre=usuario_nombre,
                created_at=datetime.utcnow(),
            )
        )


def add_documentos_if_empty(db: Session, proyecto: ProyectoLey, docs: list[tuple[str, str, str]]) -> None:
    existente = db.query(Documento).filter(Documento.proyecto_id == proyecto.id).first()
    if existente:
        return

    for nombre, url, tipo in docs:
        db.add(
            Documento(
                proyecto_id=proyecto.id,
                nombre=nombre,
                url=url,
                tipo=tipo,
                created_at=datetime.utcnow(),
            )
        )


def add_votos_if_empty(
    db: Session,
    proyecto: ProyectoLey,
    votos_data: list[tuple[Diputado, ValorVoto]],
) -> None:
    existente = db.query(Voto).filter(Voto.proyecto_id == proyecto.id).first()
    if existente:
        return

    for diputado, valor in votos_data:
        db.add(
            Voto(
                proyecto_id=proyecto.id,
                diputado_id=diputado.id,
                valor=valor,
            )
        )


def seed() -> None:
    db = SessionLocal()

    try:
        # Partidos
        liberal = get_or_create_partido(db, "Liberales Unidos", "#2563eb")
        verde = get_or_create_partido(db, "Frente Social Verde", "#16a34a")

        # Diputados
        ana = get_or_create_diputado(
            db,
            nombre="Ana Rodríguez",
            partido=liberal,
            salario=4200000,
            monto_gasolina=500000,
            fecha_inicio=date.fromisoformat("2024-05-01"),
        )
        carlos = get_or_create_diputado(
            db,
            nombre="Carlos Méndez",
            partido=verde,
            salario=4200000,
            monto_gasolina=500000,
            fecha_inicio=date.fromisoformat("2024-05-01"),
        )
        sofia = get_or_create_diputado(
            db,
            nombre="Sofía Vargas",
            partido=liberal,
            salario=4200000,
            monto_gasolina=500000,
            fecha_inicio=date.fromisoformat("2024-05-01"),
        )

        # Comisiones
        educacion = get_or_create_comision(
            db,
            nombre="Comisión de Educación",
            descripcion="Analiza proyectos de ley vinculados al sistema educativo.",
        )
        ambiente = get_or_create_comision(
            db,
            nombre="Comisión de Ambiente",
            descripcion="Estudia iniciativas sobre sostenibilidad, agua y biodiversidad.",
        )

        # Relación diputados <-> comisiones
        if ana not in educacion.miembros:
            educacion.miembros.append(ana)
        if sofia not in educacion.miembros:
            educacion.miembros.append(sofia)
        if carlos not in ambiente.miembros:
            ambiente.miembros.append(carlos)
        if sofia not in ambiente.miembros:
            ambiente.miembros.append(sofia)

        # Temas
        tema_educacion = get_or_create_tema(db, "Educación", "educacion", "#3b82f6")
        tema_ambiente = get_or_create_tema(db, "Medio Ambiente", "medio-ambiente", "#22c55e")
        tema_transparencia = get_or_create_tema(db, "Transparencia", "transparencia", "#f59e0b")

        # Proyectos
        p1 = get_or_create_proyecto(
            db,
            codigo="EXP-2025-001",
            titulo="Reforma al sistema nacional de becas universitarias",
            descripcion="Amplía cobertura, criterios de acceso y mecanismos de seguimiento para becas públicas.",
            fecha_presentacion=date.fromisoformat("2025-02-10"),
            estado=EstadoProyecto.en_comision,
            proponente=ana,
            comision=educacion,
            temas=[tema_educacion],
            texto_completo="Texto base del proyecto de becas universitarias.",
        )

        p2 = get_or_create_proyecto(
            db,
            codigo="EXP-2025-002",
            titulo="Ley de movilidad eléctrica para transporte público",
            descripcion="Promueve incentivos para la transición a flotillas eléctricas en buses y trenes.",
            fecha_presentacion=date.fromisoformat("2025-02-20"),
            estado=EstadoProyecto.en_debate,
            proponente=carlos,
            comision=ambiente,
            temas=[tema_ambiente],
            texto_completo="Texto base de movilidad eléctrica.",
        )

        p3 = get_or_create_proyecto(
            db,
            codigo="EXP-2025-003",
            titulo="Fondo nacional para infraestructura escolar",
            descripcion="Crea un fondo permanente para mantenimiento y ampliación de centros educativos.",
            fecha_presentacion=date.fromisoformat("2025-03-01"),
            estado=EstadoProyecto.presentado,
            proponente=sofia,
            comision=educacion,
            temas=[tema_educacion, tema_transparencia],
            texto_completo="Texto base del fondo de infraestructura escolar.",
        )

        p4 = get_or_create_proyecto(
            db,
            codigo="EXP-2025-004",
            titulo="Ley de transparencia presupuestaria legislativa",
            descripcion="Obliga a publicar gasto, contrataciones y ejecución presupuestaria en formatos abiertos.",
            fecha_presentacion=date.fromisoformat("2025-03-12"),
            estado=EstadoProyecto.presentado,
            proponente=ana,
            comision=None,
            temas=[tema_transparencia],
            texto_completo="Texto base de transparencia presupuestaria.",
        )

        p5 = get_or_create_proyecto(
            db,
            codigo="EXP-2025-005",
            titulo="Protección integral de cuencas hidrográficas",
            descripcion="Fortalece medidas de conservación, monitoreo y sanción en cuencas prioritarias.",
            fecha_presentacion=date.fromisoformat("2025-03-18"),
            estado=EstadoProyecto.en_comision,
            proponente=carlos,
            comision=ambiente,
            temas=[tema_ambiente, tema_transparencia],
            texto_completo="Texto base de protección de cuencas.",
        )

        # Historial
        add_historial_if_empty(
            db,
            p1,
            [
                (
                    EstadoProyecto.presentado,
                    EstadoProyecto.en_comision,
                    "Ingresó a comisión para análisis técnico.",
                    "Sistema",
                ),
            ],
        )
        add_historial_if_empty(
            db,
            p2,
            [
                (
                    EstadoProyecto.presentado,
                    EstadoProyecto.en_comision,
                    "Asignado a Comisión de Ambiente.",
                    "Sistema",
                ),
                (
                    EstadoProyecto.en_comision,
                    EstadoProyecto.en_debate,
                    "Dictamen favorable y pase a debate.",
                    "Sistema",
                ),
            ],
        )

        # Documentos
        add_documentos_if_empty(
            db,
            p1,
            [
                ("Texto sustitutivo", "https://example.org/docs/becas.pdf", "pdf"),
                ("Resumen ejecutivo", "https://example.org/docs/becas-resumen.pdf", "pdf"),
            ],
        )
        add_documentos_if_empty(
            db,
            p2,
            [
                ("Proyecto base", "https://example.org/docs/movilidad-electrica.pdf", "pdf"),
            ],
        )

        # Votos
        add_votos_if_empty(
            db,
            p2,
            [
                (ana, ValorVoto.a_favor),
                (carlos, ValorVoto.a_favor),
                (sofia, ValorVoto.abstencion),
            ],
        )

        db.commit()
        print("✅ Seed demo completado.")
        print("Partidos, diputados, comisiones, temas, proyectos, historial, documentos y votos creados.")
    except Exception as e:
        db.rollback()
        print("❌ Error en seed_demo.py")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed()