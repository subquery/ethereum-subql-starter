// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




type ApprovalProps = Omit<Approval, NonNullable<FunctionPropertyNames<Approval>>>;

export class Approval implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public value: bigint;

    public owner: string;

    public spender: string;

    public contractAddress: string;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Approval entity without an ID");
        await store.set('Approval', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Approval entity without an ID");
        await store.remove('Approval', id.toString());
    }

    static async get(id:string): Promise<Approval | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Approval entity without an ID");
        const record = await store.get('Approval', id.toString());
        if (record){
            return Approval.create(record as ApprovalProps);
        }else{
            return;
        }
    }



    static create(record: ApprovalProps): Approval {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new Approval(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
