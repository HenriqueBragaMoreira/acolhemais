-- Auditoria só de acréscimo: nenhum registro pode ser alterado ou apagado, nem por um bug
-- da aplicação. O trigger é por comando, então até um UPDATE/DELETE sem linhas falha.
-- Quem é dono da tabela ainda pode desligar o trigger ou apagá-la: separar o usuário da
-- aplicação (sem esses direitos) do usuário das migrations fica para o item de deploy.
CREATE FUNCTION audit_log_reject_change() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_log é só de acréscimo: % não é permitido', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER audit_log_append_only
BEFORE UPDATE OR DELETE OR TRUNCATE ON audit_log
FOR EACH STATEMENT EXECUTE FUNCTION audit_log_reject_change();
