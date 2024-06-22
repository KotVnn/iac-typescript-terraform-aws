import { Construct } from 'constructs';
import {Instance} from '@cdktf/provider-aws/lib/instance';
import {Eip} from '@cdktf/provider-aws/lib/eip';

export interface ComputeModuleProps {
	region: string;
	imageId: string;
	instanceType: string;
	keyName: string;
	ec2SecurityGroupIds: string[];
}

export class ComputeModule extends Construct {
	public readonly demoInstance: Instance;
	constructor(scope: Construct, id: string, props: ComputeModuleProps) {
		super(scope, id);
		
		this.demoInstance = new Instance(this, 'demoInstance', {
			ami: props.imageId,
			instanceType: props.instanceType,
			keyName: props.keyName,
			vpcSecurityGroupIds: props.ec2SecurityGroupIds,
			tags: {
				Name: 'AHT Kot Demo'
			}
		});
		
		new Eip(this, 'demoEip', {
			instance: this.demoInstance.id
		});
	}
}
