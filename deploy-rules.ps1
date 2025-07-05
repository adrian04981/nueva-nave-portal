# Script para desplegar las reglas de Firebase
# Asegúrate de tener Firebase CLI instalado: npm install -g firebase-tools

# ✅ ESTADO ACTUAL: Todo configurado y desplegado
# - Reglas de Firestore: ✅ Desplegadas y funcionando
# - Índices de Firestore: ✅ 10 índices compuestos creados
# - Proyecto: nueva-nave (activo)
# - Storage: Reglas listas (pendiente activación en consola)

# 1. Inicializar Firebase (solo la primera vez)
# firebase login
# firebase init

# 2. Desplegar las reglas de Firestore
firebase deploy --only firestore:rules

# 3. Desplegar los índices de Firestore
firebase deploy --only firestore:indexes

# 4. Desplegar las reglas de Storage (cuando se active)
firebase deploy --only storage

# 5. Desplegar todo (reglas + índices)
firebase deploy --only firestore:rules,firestore:indexes,storage

# 6. Ver el estado actual
firebase firestore:indexes
firebase projects:list

# 7. Verificar reglas (dry-run)
firebase deploy --only firestore:rules --dry-run
firebase deploy --only firestore:indexes --dry-run

# 8. Probar las reglas localmente (opcional)
# firebase emulators:start --only firestore,storage
