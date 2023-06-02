const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      try {
        if (context.user) {
          return User.findOne({ _id: context.user._id }).populate("savedBooks");
        }

        throw new AuthenticationError("Please login first.");
      } catch (err) {
        console.error(err);
      }
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      try {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
      } catch (err) {
        console.error(err);
      }
    },

    login: async (parent, { email, password }) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          throw new AuthenticationError(
            "No user found with this email address"
          );
        }

        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
          throw new AuthenticationError("Incorrect credentials");
        }

        const token = signToken(user);

        return { token, user };
      } catch (err) {
        console.error(err);
      }
    },

    saveBook: async (parent, { book }, context) => {
      try {
        if (context.user) {
          const user = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: book } },
            { new: true }
          );
          return user;
        }

        throw new AuthenticationError("Please login first.");
      } catch (err) {
        console.error(err);
      }
    },

    removeBook: async (parent, { bookId }, context) => {
      try {
        if (context.user) {
          console.log(bookId);
          const user = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId: bookId } } },
            { new: true }
          );
          console.log(user);
          return user;
        }
        throw new AuthenticationError("Please login first.");
      } catch (err) {
        console.error(err);
      }
    },
  },
};

module.exports = resolvers;
