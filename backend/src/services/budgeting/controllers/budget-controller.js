import response from '../../../utils/response.js'
import BudgetRepositories from '../repositories/budget-repositories.js'

const getAllBudgeting = async (req, res, next) => {
    const { id: user_id } = req.user
    const { bulan, tahun } = req.body

    const budgets = await BudgetRepositories.getAllBudgeting(user_id, bulan, tahun)

    return response(res, 200, 'Berhasil', { budgets })
}

const getAllBudgetiWithoutRange = async (req, res, next) => {
    const { id: user_id } = req.user
    const budgets = await BudgetRepositories.getAllBudget(user_id)

    return response(res, 200, 'Berhasil menampilkan Budget', { budgets })
}

const addBudgeting = async (req, res, next) => {
    const { id: user_id } = req.user
    const { name, allocation } = req.body

    if (await BudgetRepositories.searchBudgeting(user_id, name)) {
        return response(res, 400, 'Category budgeting sudah terdaftar')
    }

    const budget = await BudgetRepositories.addBudget(user_id, name, Number(allocation))

    return response(res, 201, 'Berhasil menambahkan budget', { id: budget })
}

const editBudgeting = async (req, res, next) => {
    const { budget_id } = req.params
    const { name, allocation } = req.body

    await BudgetRepositories.editBudget(budget_id, name, Number(allocation))

    return response(res, 200, 'Berhasil melakukan update budget')
}

const getBudgetById = async (req, res, next) => {
    const { budget_id } = req.params

    const budget = await BudgetRepositories.getBudgetById(budget_id)
    if (!budget) {
        return response(res, 404, 'Tidak ada budget yang cocok')
    }

    return response(res, 200, 'Berhasil menampilkan budget', budget)
}

const deleteBudgeting = async (req, res, next) => {
    const { budget_id } = req.params

    await BudgetRepositories.deleteBudget(budget_id)
    return response(res, 200, 'Berhasil menghapus budget')
}

export {
    getAllBudgeting,
    getAllBudgetiWithoutRange,
    addBudgeting,
    editBudgeting,
    getBudgetById,
    deleteBudgeting
}