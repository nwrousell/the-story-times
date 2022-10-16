import { useState, useEffect } from 'react'
import { CHANCE_OF_LIE, IMAGES_PER_USER, PROMPTS_PER_USER } from './constants'
import Image from './ui/Image'
import { GiFingersCrossed } from 'react-icons/gi'

export default function Writing({ currentSection, playerIndex, onSubmit, setArticle, playerName }) {
    const [isLie, setIsLie] = useState(() => Math.random() < CHANCE_OF_LIE)
    const [imageSelected, setImageSelected] = useState(-1)
    const [headline, setHeadline] = useState("")
    const [body, setBody] = useState("")

    const imagePaths = getPlayersImagePaths(currentSection.imagePaths, playerIndex)
    const prompts = getPlayerPrompts(currentSection.prompts, playerIndex)

    useEffect(() => {
        setArticle({ headline, body, author: playerName, imagePath: imagePaths[imageSelected], isLie })
    }, [imageSelected, headline, body,])

    return (
        <div>
            <ImageSelector imagePaths={imagePaths} imageSelected={imageSelected} setImageSelected={setImageSelected} />
            <div className="flex items-center gap-8 justify-around mb-8">
                { prompts.map((text, i) => <p className="text-gray-800 font-semibold" key={i}>{ text }</p>) }
            </div>
            { isLie && (<div className="flex my-4">
                <GiFingersCrossed size={32} className="mr-2" />
                <p>You're telling a lie! Try to trick everyone into believing your story by adding plenty of details.</p>
            </div>)}
            <div className="mb-8">
                <p className="text-lg font-semibold text-gray-800">Write your article</p>
                <textarea className="textarea w-full bg-gray-100 p-2" placeholder="Don't stop writing!" onChange={(e) => setBody(e.target.value)} />            
            </div>
            <div className="mb-8">
                <p className="text-lg font-semibold text-gray-800">Now give your article a <i>sensational</i> headline</p>
                <input type="text" className="input w-full border-2 border-gray-200" onChange={(e) => setHeadline(e.target.value)} />
            </div>
            
            <button onClick={onSubmit} className="btn btn-wide">Submit for Review</button>
        </div>
    )
}

function ImageSelector({ imagePaths, imageSelected, setImageSelected }) {
    
    return (
        <div className="grid grid-cols-3 gap-8 my-8">
            { imagePaths.map((imagePath, i) => <div key={i} ><Image active={i==imageSelected} onClick={() => setImageSelected(i)} path={imagePath} /></div>) }
        </div>
    )
}

function getPlayersImagePaths(allPaths: string[], playerIndex: number){
    return allPaths.slice(playerIndex*IMAGES_PER_USER, + playerIndex*IMAGES_PER_USER+IMAGES_PER_USER)
}

function getPlayerPrompts(allPrompts: string[], playerIndex: number) {
    return allPrompts.slice(playerIndex*PROMPTS_PER_USER, + playerIndex*PROMPTS_PER_USER+PROMPTS_PER_USER)
}