CREATE DATABASE IF NOT EXISTS inventario_db;
CREATE DATABASE IF NOT EXISTS cobros_db;
CREATE DATABASE IF NOT EXISTS despacho_db;
CREATE DATABASE IF NOT EXISTS envio_db;

-- -------------- AÑADIDO: CONCEDER PERMISOS ----------------

-- Le da al usuario 'user' todos los permisos sobre la nueva base de datos 'inventario_db'.
GRANT ALL PRIVILEGES ON inventario_db.* TO 'user'@'%';

-- Le da al usuario 'user' todos los permisos sobre la nueva base de datos 'cobros_db'.
GRANT ALL PRIVILEGES ON cobros_db.* TO 'user'@'%';

-- Le da al usuario 'user' todos los permisos sobre la nueva base de datos 'despacho_db'.
GRANT ALL PRIVILEGES ON despacho_db.* TO 'user'@'%';

-- Le da al usuario 'user' todos los permisos sobre la nueva base de datos 'envio_db'.
GRANT ALL PRIVILEGES ON envio_db.* TO 'user'@'%';

-- Aplica los cambios de privilegios.
FLUSH PRIVILEGES;