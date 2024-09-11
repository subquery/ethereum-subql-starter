// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression, GetOptions } from "@subql/types-core";
import assert from 'assert';



export type ApprovalProps = Omit<Approval, NonNullable<FunctionPropertyNames<Approval>>| '_name'>;

export class Approval implements Entity {

    constructor(
        
        id: string,
        owner: string,
        spender: string,
        value: bigint,
        contractAddress: string,
    ) {
        this.id = id;
        this.owner = owner;
        this.spender = spender;
        this.value = value;
        this.contractAddress = contractAddress;
        
    }

    public id: string;
    public blockHeight?: bigint;
    public owner: string;
    public spender: string;
    public value: bigint;
    public contractAddress: string;
    

    get _name(): string {
        return 'Approval';
    }

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
        if (record) {
            return this.create(record as ApprovalProps);
        } else {
            return;
        }
    }


    /**
     * Gets entities matching the specified filters and options.
     *
     * ⚠️ This function will first search cache data followed by DB data. Please consider this when using order and offset options.⚠️
     * */
    static async getByFields(filter: FieldsExpression<ApprovalProps>[], options?: GetOptions<ApprovalProps>): Promise<Approval[]> {
        const records = await store.getByFields('Approval', filter, options);
        return records.map(record => this.create(record as ApprovalProps));
    }

    static create(record: ApprovalProps): Approval {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.owner,
            record.spender,
            record.value,
            record.contractAddress,
        );
        Object.assign(entity,record);
        return entity;
    }
}
