import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
    {
        movie: { type: String, required: true, ref: 'Movie' },
        showDateTime: { type: Date, required: true },
        showPrice: { type: Number, required: true },
        sectionPrices: {
            premium: { type: Number, default: 0 },
            gold: { type: Number, default: 0 },
            silver: { type: Number, default: 0 },
        },
        occupiedSeats: { type: Object, default: {} }
    }, { minimize: false }
)

const Show = mongoose.model("Show", showSchema);

export default Show;
