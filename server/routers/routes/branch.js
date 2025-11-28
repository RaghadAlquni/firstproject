const express = require("express")

const { addBranch, getAllBranches, getBranchById, updateBranch, getBranchDetails, getBranchStats, deleteBranch, getTeachersByBranchAndShift} = require("../controller/branch.js")
const authenticate = require("../middleware/authentication.js");
const authorize = require("../middleware/authorization.js");


const branchRouter = express.Router()

branchRouter.post("/newBranch", authenticate, authorize(["admin"]), addBranch)

branchRouter.get("/allBranchs", authenticate, authorize(["admin"]), getAllBranches)
branchRouter.get("/branch/:id", authenticate, authorize(["admin", "director"]), getBranchById)

branchRouter.put("/branch/:id", authenticate, authorize(["admin", "director", "assistant_director"]), updateBranch)

// branch details
branchRouter.get("/branch/:id/details", authenticate, authorize(["admin", "director"]), getBranchDetails) // details
branchRouter.get("/branch/:id/state", authenticate, authorize(["admin", "director", "assistant_director"]), getBranchStats) // count

branchRouter.delete("/branch/:id", authenticate, authorize(["admin"]), deleteBranch)


branchRouter.get("/teachers", getTeachersByBranchAndShift);


module.exports = branchRouter;