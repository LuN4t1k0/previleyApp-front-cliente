import os
import re
from pathlib import Path

# ========== CONFIGURACIÓN PARA NEXT.JS ==========
EXTENSIONES_VALIDAS = [
    '.js', '.jsx', '.ts', '.tsx', # Archivos de React/Next.js
    '.json',                     # Archivos de configuración (package.json, tsconfig.json)
    '.css',                      # Hojas de estilo
    '.md',                       # Documentación
    '.env', '.txt', '.cjs', '.mjs'
]

EXCLUIR_ARCHIVOS = ['package-lock.json', 'yarn.lock']
EXCLUIR_CARPETAS = [
    'node_modules', '.git', '.next', # <-- Se añade .next, la carpeta de build de Next.js
    '__pycache__', 'logs', '.vscode', '.idea',
    'dist', 'build', '.export', '.venv'
]

# Ruta raíz del proyecto (donde se ejecuta el script)
directorio_raiz = os.getcwd()
carpeta_export = os.path.join(directorio_raiz, '.export')
# Se cambia el nombre del archivo de salida para reflejar que es del frontend
ruta_salida = os.path.join(carpeta_export, 'contexto_ia_frontend.txt')

# Crear carpeta si no existe
os.makedirs(carpeta_export, exist_ok=True)


# ========== FUNCIONES ==========
def es_archivo_valido(ruta):
    """Verifica si un archivo debe ser incluido en el contexto."""
    # Excluye si está en una carpeta no deseada
    if any(parte in EXCLUIR_CARPETAS for parte in Path(ruta).parts):
        return False
    # Excluye por nombre de archivo específico
    if os.path.basename(ruta) in EXCLUIR_ARCHIVOS:
        return False
    # Asegura que es un archivo y tiene una extensión válida
    if not os.path.isfile(ruta) or not any(ruta.endswith(ext) for ext in EXTENSIONES_VALIDAS):
        return False
    return True


def obtener_ruta_relativa(ruta_absoluta):
    """Obtiene la ruta del archivo relativa a la raíz del proyecto."""
    return os.path.relpath(ruta_absoluta, directorio_raiz)


def limpiar_comentarios_y_lineas(contenido, extension):
    """Elimina comentarios y líneas en blanco excesivas del contenido de un archivo."""
    # Eliminar comentarios de bloque y línea para JS, TS, JSX, TSX, CSS
    if extension in ['.js', '.ts', '.jsx', '.tsx', '.css', '.cjs', '.mjs']:
        contenido = re.sub(r'/\*[\s\S]*?\*/', '', contenido) # Comentarios de bloque /* ... */
    if extension in ['.js', '.ts', '.jsx', '.tsx', '.cjs', '.mjs']:
        contenido = re.sub(r'//.*', '', contenido) # Comentarios de línea //
    
    # Eliminar comentarios para archivos de configuración
    if extension in ['.yml', '.yaml', '.env']:
        contenido = re.sub(r'#.*', '', contenido)

    # Eliminar líneas en blanco consecutivas para mantener el código compacto
    lineas = contenido.splitlines()
    nuevas_lineas = []
    salto_previo = False
    for linea in lineas:
        if linea.strip() == '':
            if not salto_previo:
                nuevas_lineas.append(linea)
                salto_previo = True
        else:
            nuevas_lineas.append(linea)
            salto_previo = False

    return '\n'.join(nuevas_lineas).strip()


# ========== EJECUCIÓN ==========
try:
    with open(ruta_salida, 'w', encoding='utf-8') as salida:
        # Se actualiza el encabezado para el contexto del frontend
        salida.write("# CONTEXTO DEL FRONTEND PARA LLM\n")
        salida.write("# Proyecto basado en Next.js, React y Tailwind CSS\n\n")

        source_id = 1
        for carpeta_actual, subcarpetas, archivos in os.walk(directorio_raiz):
            subcarpetas[:] = [d for d in subcarpetas if d not in EXCLUIR_CARPETAS]
            
            for archivo in sorted(archivos):
                ruta_completa = os.path.join(carpeta_actual, archivo)
                
                if es_archivo_valido(ruta_completa):
                    ruta_relativa = obtener_ruta_relativa(ruta_completa).replace('\\', '/')
                    extension = Path(ruta_completa).suffix
                    
                    # Añadir la etiqueta de fuente
                    salida.write(f"")
                    source_id += 1

                    salida.write(f"\n### File: {ruta_relativa}\n")
                    salida.write("-" * 60 + "\n")
                    try:
                        with open(ruta_completa, 'r', encoding='utf-8', errors='ignore') as archivo_script:
                            contenido = archivo_script.read()
                            # La limpieza de comentarios es opcional, puedes comentarla si prefieres el código original
                            # contenido_limpio = limpiar_comentarios_y_lineas(contenido, extension)
                            salida.write(contenido + "\n")
                    except Exception as e:
                        salida.write(f"[Error al leer el archivo: {e}]\n")
                    salida.write("-" * 60 + "\n\n")

    print(f"✅ Contexto del frontend generado en: {ruta_salida}")

except Exception as e:
    print(f"❌ Ocurrió un error durante la ejecución: {e}")