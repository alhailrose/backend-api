import path from "path";
import { fileURLToPath } from "url";
import nodeExternals from "webpack-node-externals";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: "./src/server.js", // File entry utama
  target: "node", // Target environment adalah Node.js
  externals: [nodeExternals()], // Mengecualikan dependencies dari node_modules
  output: {
    path: path.resolve(__dirname, "dist"), // Folder output
    filename: "server.js", // Nama file output
    libraryTarget: "module", // Mendukung output ESM
  },
  experiments: {
    outputModule: true, // Mengaktifkan dukungan untuk output ES Modules
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Semua file .js
        exclude: /node_modules/, // Kecualikan node_modules
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"], // Transpile menggunakan preset-env
          },
        },
      },
    ],
  },
  mode: "production", // Mode produksi untuk optimasi
};
