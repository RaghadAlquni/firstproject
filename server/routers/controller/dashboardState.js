const Children = require("../../DB/models/childrenSchema");
const User = require("../../DB/models/userSchema");
const Branch = require("../../DB/models/branchSchema");
const Event = require("../../DB/models/EventSchema");
const Classroom = require("../../DB/models/classroomSchema");

const getDashboard = async (req, res) => {
  try {
    const role = req.user.role;
    const branch = req.user.branch;

    let stats = {
      totalChildren: 0,
      totalTeachers: 0,
      totalBranches: 0,
      totalRequests: 0,
      totalManager: 0,
      totalEmployees: 0,
      totalClasses: 0,
      genderStats: { boys: 0, girls: 0 },
    };

    let events = await Event.find().sort({ date: -1 }).limit(5);

    let confirmedChildrenQuery = { status: "مؤكد" };

    if (["director", "assistant_director"].includes(role)) {
      confirmedChildrenQuery.branch = branch;
    }

    // ADMIN
    if (role === "admin") {
      stats.totalChildren = await Children.countDocuments({ status: "مؤكد" });

      stats.totalTeachers = await User.countDocuments({
        role: { $in: ["teacher", "assistant_teacher"] },
      });

      stats.totalManager = await User.countDocuments({
        role: { $in: ["director", "assistant_director"] },
      });

      stats.totalEmployees = await User.countDocuments({
        role: {
          $in: [
            "admin",
            "director",
            "assistant_director",
            "teacher",
            "assistant_teacher",
          ],
        },
      });

      stats.totalBranches = await Branch.countDocuments();

      stats.totalRequests = await Children.countDocuments({
        status: "مضاف",
      });
    }

    // DIRECTOR
    else if (role === "director") {
      stats.totalChildren = await Children.countDocuments({
        branch,
        status: "مؤكد",
      });

      stats.totalTeachers = await User.countDocuments({
        role: { $in: ["teacher", "assistant_teacher"] },
        branch,
      });

      stats.totalManager = await User.countDocuments({
        role: { $in: ["director", "assistant_director"] },
        branch,
      });

      stats.totalEmployees = await User.countDocuments({
        role: {
          $in: [
            "director",
            "assistant_director",
            "teacher",
            "assistant_teacher",
          ],
        },
        branch,
      });

      stats.totalRequests = await Children.countDocuments({
        branch,
        status: "مضاف",
      });
    }

    // ASSISTANT DIRECTOR
    else if (role === "assistant_director") {
      stats.totalChildren = await Children.countDocuments({
        branch,
        status: "مؤكد",
      });

      stats.totalTeachers = await User.countDocuments({
        role: { $in: ["teacher", "assistant_teacher"] },
        branch,
      });

      stats.totalEmployees = await User.countDocuments({
        role: {
          $in: [
            "director",
            "assistant_director",
            "teacher",
            "assistant_teacher",
          ],
        },
        branch,
      });

      stats.totalRequests = await Children.countDocuments({
        branch,
        status: "مضاف",
      });
    }

    // TEACHER
    else if (role === "teacher") {
      const teacherData = await User.findById(req.user._id).populate(
        "teacherChildren"
      );

      const assignedChildren = teacherData.teacherChildren || [];

      const confirmedChildren = assignedChildren.filter(
        (child) => child.status === "مؤكد"
      );

      stats.totalChildren = confirmedChildren.length;

      stats.totalClasses = await Classroom.countDocuments({
        teacherMain: req.user._id,
      });

      const boys = confirmedChildren.filter((ch) => ch.gender === "ولد").length;
      const girls = confirmedChildren.filter((ch) => ch.gender === "بنت").length;

      stats.genderStats = { boys, girls };
    }

    // gender for others
    if (role !== "teacher") {
      const boys = await Children.countDocuments({
        ...confirmedChildrenQuery,
        gender: "ولد",
      });

      const girls = await Children.countDocuments({
        ...confirmedChildrenQuery,
        gender: "بنت",
      });

      stats.genderStats = { boys, girls };
    }

    const chartData = [
      { label: "1", expenses: 120, payments: 90 },
      { label: "2", expenses: 140, payments: 110 },
      { label: "3", expenses: 170, payments: 100 },
      { label: "4", expenses: 200, payments: 150 },
      { label: "5", expenses: 160, payments: 180 },
      { label: "6", expenses: 130, payments: 120 },
    ];

    return res.status(200).json({
      stats,
      events,
      chartData,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error loading dashboard" });
  }
};

module.exports = { getDashboard };
