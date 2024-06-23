import { Construct } from 'constructs';
import {TerraformStack, TerraformHclModule} from "cdktf";
import {AwsProvider} from '@cdktf/provider-aws/lib/provider';
import {Variables} from '../variables';

export interface VpcModuleProps {
	vpcName: string;
	cidrBlock: string;
	availabilityZones: string[];
	publicSubnetIps: string[];
	privateSubnetIps: string[];
}

export class NetworkModule extends TerraformStack {
	constructor(scope: Construct, id: string, provider: AwsProvider) {
		super(scope, id);
		
		new TerraformHclModule(this, 'Vpc', {
			source: Variables.vpcSource,
			variables: {
				name: Variables.vpcName,
				cidr: Variables.cidrBlock,
				azs: Variables.availabilityZones,
				private_subnets: Variables.privateSubnetIps,
				public_subnets: Variables.publicSubnetIps,
				enable_nat_gateway: Variables.enableNatGateway,
				enable_vpn_gateway: Variables.enableVpnGateway,
			},
			providers: [provider],
		});
	}
}
