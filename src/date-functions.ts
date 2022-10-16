import dayjs from "dayjs"

export function getDateXSecondsAway(seconds: number){
    return dayjs().add(seconds, 'seconds').toDate()
}

export function getDateForFlipdown(date){
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}