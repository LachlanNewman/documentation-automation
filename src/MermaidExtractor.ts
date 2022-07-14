import fs from 'fs'
import mermaid from 'headless-mermaid'

export class MermaidSvgExtractor{
    public static START_FLAG = Buffer.from('```mermaid\n')
    public static END_FLAG = Buffer.from('```\n')
    
    protected buffers: Buffer[] = []

    public inSection = false;

    isStartOf(buffer: Buffer):boolean{
        return MermaidSvgExtractor.START_FLAG.equals(buffer) && !this.inSection
    }

    isEndOf(buffer: Buffer): boolean{
        return MermaidSvgExtractor.END_FLAG.equals(buffer) && this.inSection
    }

    resetBuffers(){
        this.buffers =[]
    }

    push(buffer: Buffer){
        this.buffers.push(buffer)
    }

    async write(filename:string){
        const data = Buffer.concat(this.buffers).toString('utf-8')
        console.log(data)
        let svg = await mermaid.execute(data)
        fs.writeFileSync(`${filename}.svg`,svg)
    }
}