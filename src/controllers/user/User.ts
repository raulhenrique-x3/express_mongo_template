import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../../model/User";
import { generateAccessToken, generateRefreshToken } from "../../util/jwt";
import { IUser } from "../../types/user";

class UserController {
  public async register(req: Request, res: Response) {
    try {
      const { name, email, phone, cpf, password } = req.body;
      const searchEmail = await User.findOne({ email });

      if (searchEmail) {
        return res.status(400).send({ message: "Email em uso!" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const saveUser = new User({
        name,
        email,
        password: hashedPassword,
      });

      await saveUser.save();

      return res.status(200).send({ message: "Usuário criado com sucesso!" });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Erro interno do servidor" });
    }
  }

  public async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Preencha os campos corretamente" });
      }

      const userVerify = await User.findOne<Promise<IUser>>({ email: email });

      if (!userVerify) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const validyPassword = await bcrypt.compare(
        password,
        userVerify.password
      );

      if (userVerify && validyPassword) {
        const token = generateAccessToken(userVerify?.name);
        const refresh_token = generateRefreshToken(userVerify?.name);

        return res.status(200).json({
          token,
          refresh_token,
          email: userVerify.email,
          _id: userVerify._id,
        });
      } else {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  public async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const searchUser = await User.findById(id, { password: 0 });
      if (!searchUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.status(200).json(searchUser);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  public async editUser(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const { id } = req.params;
      const { picture }: any = req.file ? req.file : "";
      const searchUser = await User.findByIdAndUpdate(id, {
        name,
        email,
        password,
        picture,
      });
      searchUser?.save();

      if (!searchUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res
        .status(200)
        .json({ message: "Usuário atualizado com sucesso" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  public async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { password } = req.body;

      const searchUser = await User.findById(id);
      if (!searchUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        searchUser.password
      );

      if (!isPasswordValid) {
        return res.status(400).json({ message: "Senha inválida" });
      }

      await User.findByIdAndDelete(id);
      return res.status(200).json({ message: "Usuário deletado com sucesso" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  public async changePassword(req: Request, res: Response) {
    try {
      const { password, id } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.findByIdAndUpdate(id, { password: hashedPassword });
      await User.findByIdAndUpdate(id, { $inc: { tokenVersion: 1 } });

      return res.status(200).json({ message: "Senha alterada com sucesso" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}

export default new UserController();
