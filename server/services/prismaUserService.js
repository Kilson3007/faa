const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  // Criar usuário
  async createUser(data) {
    return prisma.user.create({ data });
  },

  // Buscar usuário por ID
  async getUserById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  // Buscar usuário por email
  async getUserByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  // Buscar usuário por militaryId
  async getUserByMilitaryId(militaryId) {
    return prisma.user.findUnique({ where: { militaryId } });
  },

  // Listar todos os usuários
  async listUsers() {
    return prisma.user.findMany();
  },

  // Atualizar usuário
  async updateUser(id, data) {
    return prisma.user.update({ where: { id }, data });
  },

  // Deletar usuário
  async deleteUser(id) {
    return prisma.user.delete({ where: { id } });
  },

  // Autenticação simples (email + senha)
  async authenticate(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.password === password) {
      return user;
    }
    return null;
  },
}; 