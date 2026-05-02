export default function handler(req, res) {
  return res.status(200).json({
    status: "API WORKING",
    body: req.body || "no body received"
  });
}
      
