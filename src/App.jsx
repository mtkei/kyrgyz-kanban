import React, { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import Auth from "./Auth"
import { getTranslation, translations } from "./translations"
import "./App.css"

const App = () => {
	const [user, setUser] = useState(null)
	const [language, setLanguage] = useState(
		localStorage.getItem("kanban-language") || "en"
	)
	const [boards, setBoards] = useState([])
	const [currentBoardId, setCurrentBoardId] = useState(null)
	const [newBoardName, setNewBoardName] = useState("")
	const [showNewBoard, setShowNewBoard] = useState(false)
	const [searchTerm, setSearchTerm] = useState("")
	const [assistantPrompt, setAssistantPrompt] = useState("")
	const [assistantResponse, setAssistantResponse] = useState("")
	const [assistantLoading, setAssistantLoading] = useState(false)
	const [theme, setTheme] = useState(
		localStorage.getItem("kanban-theme") ||
			(window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light")
	)
	const siteName = "Kyrgyz Kanban"

	const t = (key) => getTranslation(language, key)

	// Load user from localStorage on mount
	useEffect(() => {
		const savedUser = localStorage.getItem("kanban-current-user")
		if (savedUser) {
			setUser(JSON.parse(savedUser))
		}
	}, [])

	// Load boards for current user
	useEffect(() => {
		if (!user) return

		const userBoardsKey = `kanban-boards-${user.id}`
		const savedBoards = localStorage.getItem(userBoardsKey)

		if (savedBoards) {
			const parsed = JSON.parse(savedBoards)
			setBoards(parsed)
			if (parsed.length > 0 && !currentBoardId) {
				setCurrentBoardId(parsed[0].id)
			}
		} else {
			// Create default board
			const defaultBoard = {
				id: Date.now().toString(),
				name: t("myBoard"),
				lists: [
					{
						id: "1",
						title: t("toDo"),
						cards: [
							{ id: "1-1", content: "Get started with Trello" },
							{ id: "1-2", content: "Create your first card" },
						],
					},
					{
						id: "2",
						title: t("inProgress"),
						cards: [{ id: "2-1", content: "Build kanban board" }],
					},
					{
						id: "3",
						title: t("done"),
						cards: [{ id: "3-1", content: "Set up project" }],
					},
				],
			}
			setBoards([defaultBoard])
			setCurrentBoardId(defaultBoard.id)
		}
	}, [user])

	// Save boards to localStorage whenever boards change
	useEffect(() => {
		if (user && boards.length > 0) {
			const userBoardsKey = `kanban-boards-${user.id}`
			localStorage.setItem(userBoardsKey, JSON.stringify(boards))
		}
	}, [boards, user])

	// Save language preference
	useEffect(() => {
		localStorage.setItem("kanban-language", language)
	}, [language])

	useEffect(() => {
		localStorage.setItem("kanban-theme", theme)
		if (theme === "dark") {
			document.body.classList.add("theme-dark")
		} else {
			document.body.classList.remove("theme-dark")
		}
	}, [theme])

	useEffect(() => {
		document.title = siteName
	}, [siteName])

	const handleLogin = (userData) => {
		setUser(userData)
		localStorage.setItem("kanban-current-user", JSON.stringify(userData))
	}

	const handleLogout = () => {
		setUser(null)
		setBoards([])
		setCurrentBoardId(null)
		localStorage.removeItem("kanban-current-user")
	}

	const currentBoard = boards.find((b) => b.id === currentBoardId)

	const createBoard = () => {
		if (!newBoardName.trim()) return

		const newBoard = {
			id: Date.now().toString(),
			name: newBoardName,
			lists: [
				{ id: "1", title: t("toDo"), cards: [] },
				{ id: "2", title: t("inProgress"), cards: [] },
				{ id: "3", title: t("done"), cards: [] },
			],
		}

		setBoards([...boards, newBoard])
		setCurrentBoardId(newBoard.id)
		setNewBoardName("")
		setShowNewBoard(false)
	}

	const deleteBoard = (boardId) => {
		const updated = boards.filter((b) => b.id !== boardId)
		setBoards(updated)
		if (boardId === currentBoardId && updated.length > 0) {
			setCurrentBoardId(updated[0].id)
		} else if (updated.length === 0) {
			setCurrentBoardId(null)
		}
	}

	const addList = () => {
		if (!currentBoard) return

		const newList = {
			id: Date.now().toString(),
			title: t("newList"),
			cards: [],
		}

		const updated = boards.map((board) =>
			board.id === currentBoardId
				? { ...board, lists: [...board.lists, newList] }
				: board
		)

		setBoards(updated)
	}

	const updateListTitle = (listId, newTitle) => {
		const updated = boards.map((board) =>
			board.id === currentBoardId
				? {
						...board,
						lists: board.lists.map((list) =>
							list.id === listId ? { ...list, title: newTitle } : list
						),
				  }
				: board
		)
		setBoards(updated)
	}

	const deleteList = (listId) => {
		const updated = boards.map((board) =>
			board.id === currentBoardId
				? {
						...board,
						lists: board.lists.filter((list) => list.id !== listId),
				  }
				: board
		)
		setBoards(updated)
	}

	const addCard = (listId, content) => {
		if (!content.trim()) return

		const newCard = {
			id: `${listId}-${Date.now()}`,
			content: content.trim(),
		}

		const updated = boards.map((board) =>
			board.id === currentBoardId
				? {
						...board,
						lists: board.lists.map((list) =>
							list.id === listId
								? { ...list, cards: [...list.cards, newCard] }
								: list
						),
				  }
				: board
		)

		setBoards(updated)
	}

	const updateCard = (listId, cardId, newContent) => {
		const updated = boards.map((board) =>
			board.id === currentBoardId
				? {
						...board,
						lists: board.lists.map((list) =>
							list.id === listId
								? {
										...list,
										cards: list.cards.map((card) =>
											card.id === cardId
												? { ...card, content: newContent }
												: card
										),
								  }
								: list
						),
				  }
				: board
		)
		setBoards(updated)
	}

	const deleteCard = (listId, cardId) => {
		const updated = boards.map((board) =>
			board.id === currentBoardId
				? {
						...board,
						lists: board.lists.map((list) =>
							list.id === listId
								? {
										...list,
										cards: list.cards.filter((card) => card.id !== cardId),
								  }
								: list
						),
				  }
				: board
		)
		setBoards(updated)
	}

	const onDragEnd = (result) => {
		if (!result.destination || !currentBoard) return

		const { source, destination } = result

		// Moving within the same list
		if (source.droppableId === destination.droppableId) {
			const list = currentBoard.lists.find((l) => l.id === source.droppableId)
			const newCards = Array.from(list.cards)
			const [removed] = newCards.splice(source.index, 1)
			newCards.splice(destination.index, 0, removed)

			const updated = boards.map((board) =>
				board.id === currentBoardId
					? {
							...board,
							lists: board.lists.map((l) =>
								l.id === source.droppableId ? { ...l, cards: newCards } : l
							),
					  }
					: board
			)
			setBoards(updated)
		} else {
			// Moving between lists
			const sourceList = currentBoard.lists.find(
				(l) => l.id === source.droppableId
			)
			const destList = currentBoard.lists.find(
				(l) => l.id === destination.droppableId
			)

			const sourceCards = Array.from(sourceList.cards)
			const destCards = Array.from(destList.cards)

			const [removed] = sourceCards.splice(source.index, 1)
			destCards.splice(destination.index, 0, removed)

			const updated = boards.map((board) =>
				board.id === currentBoardId
					? {
							...board,
							lists: board.lists.map((l) => {
								if (l.id === source.droppableId) {
									return { ...l, cards: sourceCards }
								} else if (l.id === destination.droppableId) {
									return { ...l, cards: destCards }
								}
								return l
							}),
					  }
					: board
			)
			setBoards(updated)
		}
	}

	const loadSampleData = () => {
		if (!currentBoard) return

		const sampleLists = [
			{
				id: "1",
				title: t("toDo"),
				cards: [
					{ id: "1-1", content: "Design login form" },
					{ id: "1-2", content: "Draft project plan" },
				],
			},
			{
				id: "2",
				title: t("inProgress"),
				cards: [
					{ id: "2-1", content: "Build kanban board" },
					{ id: "2-2", content: "Style header and cards" },
				],
			},
			{
				id: "3",
				title: t("done"),
				cards: [
					{ id: "3-1", content: "Set up Vite + React" },
					{ id: "3-2", content: "Create authentication flow" },
				],
			},
		]

		const updated = boards.map((board) =>
			board.id === currentBoardId ? { ...board, lists: sampleLists } : board
		)
		setBoards(updated)
	}

	const generateAssistantResponse = () => {
		if (!currentBoard) return

		const lists = currentBoard.lists || []
		const allCards = lists.flatMap((l) => l.cards || [])

		if (!allCards.length) {
			setAssistantResponse(t("assistantNoData"))
			return
		}

		setAssistantLoading(true)

		const totalCards = allCards.length
		const listSummaries = lists
			.map((l) => `${l.title}: ${l.cards.length}`)
			.join(", ")
		const todoList =
			lists.find((l) => l.title.toLowerCase().includes("to do")) || lists[0]
		const inProgress = lists.find((l) =>
			l.title.toLowerCase().includes("progress")
		)

		const nextSteps = []
		if (todoList && todoList.cards.length) {
			nextSteps.push(
				`Next up: ${todoList.cards
					.slice(0, 2)
					.map((c) => c.content)
					.join("; ")}`
			)
		}
		if (inProgress && inProgress.cards.length) {
			nextSteps.push(
				`In progress: ${inProgress.cards
					.slice(0, 2)
					.map((c) => c.content)
					.join("; ")}`
			)
		}

		const prompt = assistantPrompt.trim()
		const promptLine = prompt ? `Prompt: ${prompt}` : "Prompt: (none)"

		const response = [
			`Summary: ${totalCards} cards across ${lists.length} lists (${listSummaries}).`,
			nextSteps.length ? nextSteps.join(" | ") : "No active items yet.",
			promptLine,
			"Suggested next steps:",
			"- Clarify acceptance criteria for top tasks.",
			"- Add due dates or owners to cards.",
			"- Move blocked items to a dedicated list.",
		].join("\n")

		setTimeout(() => {
			setAssistantResponse(response)
			setAssistantLoading(false)
		}, 300)
	}

	// Show auth if not logged in
	if (!user) {
		return (
			<>
				<div
					style={{
						position: "absolute",
						top: "1rem",
						right: "1rem",
						zIndex: 1000,
					}}
				>
					<select
						value={language}
						onChange={(e) => setLanguage(e.target.value)}
						style={{
							padding: "0.5rem 1rem",
							border: "2px solid rgba(255, 255, 255, 0.3)",
							borderRadius: "6px",
							background: "rgba(255, 255, 255, 0.9)",
							color: "#172b4d",
							fontSize: "0.9rem",
							cursor: "pointer",
						}}
					>
						<option value="en">{translations.en.english}</option>
						<option value="ky">{translations.en.kyrgyz}</option>
						<option value="ru">{translations.en.russian}</option>
					</select>
				</div>
				<Auth onLogin={handleLogin} translations={translations[language]} />
			</>
		)
	}

	if (!currentBoard) {
		return (
			<div className="app">
				<header className="header">
					<div className="header-content">
						<div className="header-top">
							<h1>{siteName}</h1>
							<div className="header-actions">
								<select
									value={language}
									onChange={(e) => setLanguage(e.target.value)}
									className="language-selector"
								>
									<option value="en">{t("english")}</option>
									<option value="ky">{t("kyrgyz")}</option>
									<option value="ru">{t("russian")}</option>
								</select>
								<span className="user-info">
									{t("loggedInAs")}: {user.name}
								</span>
								<button onClick={handleLogout} className="logout-btn">
									{t("logout")}
								</button>
							</div>
						</div>
					</div>
				</header>
				<div className="empty-state">
					<h1>{siteName}</h1>
					<p>{t("createFirstBoard")}</p>
					<div className="new-board-form">
						<input
							type="text"
							placeholder={t("boardName")}
							value={newBoardName}
							onChange={(e) => setNewBoardName(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && createBoard()}
						/>
						<button onClick={createBoard}>{t("createBoard")}</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="app">
			<header className="header">
				<div className="header-content">
					<div className="header-top">
						<h1>{siteName}</h1>
						<div className="header-actions">
							<select
								value={language}
								onChange={(e) => setLanguage(e.target.value)}
								className="language-selector"
							>
								<option value="en">{t("english")}</option>
								<option value="ky">{t("kyrgyz")}</option>
								<option value="ru">{t("russian")}</option>
							</select>
							<span className="user-info">
								{t("loggedInAs")}: {user.name}
							</span>
							<button
								className="theme-toggle"
								onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
							>
								{theme === "dark" ? t("light") : t("dark")}
							</button>
							<button onClick={handleLogout} className="logout-btn">
								{t("logout")}
							</button>
						</div>
					</div>
					<div className="board-selector">
						<select
							value={currentBoardId}
							onChange={(e) => setCurrentBoardId(e.target.value)}
						>
							{boards.map((board) => (
								<option key={board.id} value={board.id}>
									{board.name}
								</option>
							))}
						</select>
						{showNewBoard ? (
							<div className="new-board-form">
								<input
									type="text"
									placeholder={t("boardName")}
									value={newBoardName}
									onChange={(e) => setNewBoardName(e.target.value)}
									onKeyPress={(e) => {
										if (e.key === "Enter") createBoard()
										if (e.key === "Escape") {
											setShowNewBoard(false)
											setNewBoardName("")
										}
									}}
									autoFocus
								/>
								<button onClick={createBoard}>{t("create")}</button>
								<button
									onClick={() => {
										setShowNewBoard(false)
										setNewBoardName("")
									}}
								>
									{t("cancel")}
								</button>
							</div>
						) : (
							<>
								<button onClick={() => setShowNewBoard(true)}>
									{t("newBoard")}
								</button>
								<button
									onClick={() => deleteBoard(currentBoardId)}
									className="delete-btn"
								>
									{t("deleteBoard")}
								</button>
								<button onClick={loadSampleData} className="sample-btn">
									{t("loadSamples")}
								</button>
							</>
						)}
						<div className="search-wrapper">
							<input
								type="text"
								className="search-input"
								placeholder={t("searchPlaceholder")}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
				</div>
			</header>

			<div className="board-container">
				<DragDropContext onDragEnd={onDragEnd}>
					<div className="board">
						{currentBoard.lists.map((list) => (
							<List
								key={list.id}
								list={list}
								onAddCard={addCard}
								onUpdateCard={updateCard}
								onDeleteCard={deleteCard}
								onUpdateTitle={updateListTitle}
								onDelete={deleteList}
								t={t}
								searchTerm={searchTerm}
							/>
						))}
						<button className="add-list-btn" onClick={addList}>
							{t("addAnotherList")}
						</button>
					</div>
				</DragDropContext>
			</div>

			<section className="assistant-panel">
				<div className="assistant-header">
					<div>
						<h2>{t("assistantTitle")}</h2>
						<p className="assistant-subtitle">{t("assistantSubtitle")}</p>
					</div>
					<button
						className="assistant-btn"
						onClick={generateAssistantResponse}
						disabled={assistantLoading}
					>
						{assistantLoading
							? t("assistantGenerating")
							: t("assistantGenerate")}
					</button>
				</div>
				<div className="assistant-body">
					<textarea
						className="assistant-input"
						placeholder={t("assistantPlaceholder")}
						value={assistantPrompt}
						onChange={(e) => setAssistantPrompt(e.target.value)}
					/>
					<div className="assistant-output">
						{assistantResponse ? (
							<pre>{assistantResponse}</pre>
						) : (
							<span className="assistant-hint">
								{t("assistantPlaceholder")}
							</span>
						)}
					</div>
				</div>
			</section>
		</div>
	)
}

const List = ({
	list,
	onAddCard,
	onUpdateCard,
	onDeleteCard,
	onUpdateTitle,
	onDelete,
	t,
	searchTerm,
}) => {
	const [isEditingTitle, setIsEditingTitle] = useState(false)
	const [title, setTitle] = useState(list.title)
	const [newCardContent, setNewCardContent] = useState("")
	const [showAddCard, setShowAddCard] = useState(false)

	const visibleCards = searchTerm
		? list.cards.filter((card) =>
				card.content.toLowerCase().includes(searchTerm.toLowerCase())
		  )
		: list.cards

	useEffect(() => {
		setTitle(list.title)
	}, [list.title])

	const handleTitleSubmit = () => {
		if (title.trim()) {
			onUpdateTitle(list.id, title.trim())
		} else {
			setTitle(list.title)
		}
		setIsEditingTitle(false)
	}

	const handleAddCard = () => {
		if (newCardContent.trim()) {
			onAddCard(list.id, newCardContent)
			setNewCardContent("")
			setShowAddCard(false)
		}
	}

	return (
		<div className="list">
			<div className="list-header">
				{isEditingTitle ? (
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						onBlur={handleTitleSubmit}
						onKeyPress={(e) => {
							if (e.key === "Enter") handleTitleSubmit()
							if (e.key === "Escape") {
								setTitle(list.title)
								setIsEditingTitle(false)
							}
						}}
						autoFocus
						className="list-title-input"
					/>
				) : (
					<h3 onClick={() => setIsEditingTitle(true)} className="list-title">
						{list.title}
					</h3>
				)}
				<button onClick={() => onDelete(list.id)} className="delete-list-btn">
					×
				</button>
			</div>

			<Droppable droppableId={list.id}>
				{(provided, snapshot) => (
					<div
						ref={provided.innerRef}
						{...provided.droppableProps}
						className={`list-cards ${
							snapshot.isDraggingOver ? "dragging-over" : ""
						}`}
					>
						{visibleCards.map((card, index) => (
							<Card
								key={card.id}
								card={card}
								index={index}
								listId={list.id}
								onUpdate={onUpdateCard}
								onDelete={onDeleteCard}
							/>
						))}
						{provided.placeholder}
					</div>
				)}
			</Droppable>

			{showAddCard ? (
				<div className="add-card-form">
					<textarea
						placeholder={t("enterCardTitle")}
						value={newCardContent}
						onChange={(e) => setNewCardContent(e.target.value)}
						onKeyPress={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault()
								handleAddCard()
							}
							if (e.key === "Escape") {
								setShowAddCard(false)
								setNewCardContent("")
							}
						}}
						autoFocus
						className="card-input"
					/>
					<div className="add-card-actions">
						<button onClick={handleAddCard} className="add-btn">
							{t("addCardButton")}
						</button>
						<button
							onClick={() => {
								setShowAddCard(false)
								setNewCardContent("")
							}}
							className="cancel-btn"
						>
							{t("cancel")}
						</button>
					</div>
				</div>
			) : (
				<button onClick={() => setShowAddCard(true)} className="add-card-btn">
					{t("addCard")}
				</button>
			)}
		</div>
	)
}

const Card = ({ card, index, listId, onUpdate, onDelete }) => {
	const [isEditing, setIsEditing] = useState(false)
	const [content, setContent] = useState(card.content)

	useEffect(() => {
		setContent(card.content)
	}, [card.content])

	const handleSubmit = () => {
		if (content.trim()) {
			onUpdate(listId, card.id, content.trim())
		} else {
			setContent(card.content)
		}
		setIsEditing(false)
	}

	return (
		<Draggable draggableId={card.id} index={index}>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					className={`card ${snapshot.isDragging ? "dragging" : ""}`}
				>
					{isEditing ? (
						<textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							onBlur={handleSubmit}
							onKeyPress={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault()
									handleSubmit()
								}
								if (e.key === "Escape") {
									setContent(card.content)
									setIsEditing(false)
								}
							}}
							autoFocus
							className="card-edit-input"
						/>
					) : (
						<>
							<p onClick={() => setIsEditing(true)} className="card-content">
								{card.content}
							</p>
							<button
								onClick={() => onDelete(listId, card.id)}
								className="delete-card-btn"
							>
								×
							</button>
						</>
					)}
				</div>
			)}
		</Draggable>
	)
}

export default App
