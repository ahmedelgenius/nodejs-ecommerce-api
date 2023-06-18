const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category required"],
      unique: [true, "Category must be unique"],
      minLength: [3, "too short category name"],
      maxLength: [30, "too long category name"],
    },
    nameAr: {
      type: String,
      required: [true, "الفئة مطلوبة"],
      unique: [true, "يجب أن تكون الفئة فريدة"],
      minLength: [3, "اسم فئة قصير جدا"],
      maxLength: [30, "اسم فئة طويل جدًا"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  const imageURL = `${process.env.BASE_URL}/categories/${doc.image}`;
  doc.image = imageURL;
};
categorySchema.post("init", (doc) => {
  setImageURL(doc);
});
categorySchema.post("save", (doc) => {
  setImageURL(doc);
});
const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
